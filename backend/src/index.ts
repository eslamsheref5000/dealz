
export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) { },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // 0. Backfill Slugs (SEO)
    const makeSlug = (str) => {
      return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    try {
      const productsToUpdate = await strapi.documents('api::product.product').findMany({
        status: 'published',
        // filters: { slug: { $null: true } } // Strapi 5 filters might be null or empty string.
      });

      for (const product of productsToUpdate) {
        if (!product.slug) {
          const newSlug = `${makeSlug(product.title)}-${product.documentId.slice(-6)}`; // Short ID suffix
          console.log(`Backfilling slug for ${product.title}: ${newSlug}`);
          await strapi.documents('api::product.product').update({
            documentId: product.documentId,
            data: { slug: newSlug },
            status: 'published'
          });
        }
      }
    } catch (err) {
      console.error("Backfill Error:", err);
    }

    // 0.5 Backfill Conversations
    try {
      console.log("Checking for messages to group into conversations...");
      const messages = await strapi.documents('api::message.message').findMany({
        populate: ['sender', 'receiver', 'product', 'conversation'], // Populate conversation to skip if done
        status: 'published'
      });

      const groups = {};
      for (const msg of messages) {
        if (!msg.sender || !msg.receiver || !msg.product) continue;
        if (msg.conversation) continue; // Skip if already linked

        // Sort participants to ensure consistency (A->B is same as B->A)
        const participants = [msg.sender.documentId, msg.receiver.documentId].sort();
        const key = `${participants.join('_')}_${msg.product.documentId}`;

        if (!groups[key]) {
          groups[key] = {
            participants: [msg.sender.documentId, msg.receiver.documentId],
            participantDocs: participants,
            product: msg.product.documentId,
            messages: []
          };
        }
        groups[key].messages.push(msg.documentId);
      }

      const groupKeys = Object.keys(groups);
      if (groupKeys.length > 0) {
        console.log(`Found ${groupKeys.length} new conversation groups to create.`);

        for (const key of groupKeys) {
          const group = groups[key];

          // Check for existing conversation (idempotency)
          const existingConvs = await strapi.documents('api::conversation.conversation').findMany({
            filters: {
              $and: [
                { participants: { documentId: { $eq: group.participantDocs[0] } } },
                { participants: { documentId: { $eq: group.participantDocs[1] } } },
                { product: { documentId: { $eq: group.product } } }
              ]
            },
            status: 'published'
          });

          let conversationId;
          if (existingConvs.length > 0) {
            conversationId = existingConvs[0].documentId;
          } else {
            console.log(`Creating conversation for group ${key}`);
            const newConv = await strapi.documents('api::conversation.conversation').create({
              data: {
                participants: group.participantDocs, // Array of Document IDs
                product: group.product,
                publishedAt: new Date()
              },
              status: 'published'
            });
            conversationId = newConv.documentId;
          }

          for (const msgId of group.messages) {
            await strapi.documents('api::message.message').update({
              documentId: msgId,
              data: { conversation: conversationId },
              status: 'published'
            });
          }
        }
      }
    } catch (err) {
      console.error("Conversation Backfill Error:", err);
    }

    // 1. Grant permissions to Public role
    const publicRole = await strapi.query("plugin::users-permissions.role").findOne({ where: { type: "public" } });

    if (publicRole) {
      const permissionsToEnable = [
        "api::product.product.find",
        "api::product.product.findOne",
        "api::product.product.create",
        "api::category.category.find",
        "api::category.category.findOne",
        "plugin::users-permissions.user.me",
        "api::message.message.find",
        "api::message.message.findOne",
        "api::message.message.create",
        "api::sub-category.sub-category.find",
        "api::sub-category.sub-category.findOne",
        "api::review.review.find",
        "api::review.review.findOne",
        "api::conversation.conversation.find",
        "api::conversation.conversation.findOne",
      ];

      const permissions = await strapi.query("plugin::users-permissions.permission").findMany({
        where: { role: publicRole.id, action: { $in: permissionsToEnable } }
      });

      for (const action of permissionsToEnable) {
        if (!permissions.find((p) => p.action === action)) {
          await strapi.query("plugin::users-permissions.permission").create({
            data: { action, role: publicRole.id }
          });
        }
      }
    }

    // 1.5 Grant permissions to Authenticated role
    const authRole = await strapi.query("plugin::users-permissions.role").findOne({ where: { type: "authenticated" } });

    if (authRole) {
      const authPermissions = [
        "api::product.product.find",
        "api::product.product.findOne",
        "api::product.product.create",
        "api::product.product.update",
        "api::product.product.delete",
        "api::category.category.find",
        "api::category.category.findOne",
        "plugin::users-permissions.user.me",
        "plugin::users-permissions.user.update",
        "api::message.message.find",
        "api::message.message.findOne",
        "api::message.message.create",
        "plugin::upload.content-api.upload",
        "api::sub-category.sub-category.find",
        "api::sub-category.sub-category.findOne",
        "api::review.review.find",
        "api::review.review.findOne",
        "api::review.review.create",
        "api::product.product.approve",
        "api::product.product.reject",
        "api::product.product.disable",
        "api::product.product.getPendingKYC",
        "api::product.product.approveKYC",
        "api::product.product.rejectKYC",
      ];

      const existingPerms = await strapi.query("plugin::users-permissions.permission").findMany({
        where: { role: authRole.id, action: { $in: authPermissions } }
      });

      for (const action of authPermissions) {
        if (!existingPerms.find((p) => p.action === action)) {
          await strapi.query("plugin::users-permissions.permission").create({
            data: { action, role: authRole.id }
          });
        }
      }
    }

    // 2. Seed Categories
    const categoryNames = [
      'Motors', 'Mobiles', 'Properties', 'Electronics',
      'Furniture & Garden', 'Jobs', 'Services', 'Community',
      'Pets', 'Fashion & Beauty', 'Hobbies, Sports & Kids'
    ];

    // Cleanup duplicates
    const allCategories = await strapi.db.query('api::category.category').findMany({ limit: 1000 });
    const seenNames = new Set();

    for (const cat of allCategories) {
      if (seenNames.has(cat.name)) {
        await strapi.db.query('api::category.category').delete({ where: { id: cat.id } });
      } else {
        seenNames.add(cat.name);
      }
    }

    for (const name of categoryNames) {
      if (!seenNames.has(name)) {
        await strapi.documents('api::category.category').create({
          data: { name },
          status: 'published'
        });
      } else {
        const cat = allCategories.find(c => c.name === name);
        if (cat && !cat.publishedAt) {
          await strapi.documents('api::category.category').publish({
            documentId: cat.documentId,
            status: 'published'
          });
        }
      }
    }

    // 3. Seed Sub-Categories (Using 'documents' API for draft/publish)
    const subCats = [
      // Motors
      { name: 'Sedan', parent: 'Motors' },
      { name: 'SUV', parent: 'Motors' },
      { name: 'Coupe', parent: 'Motors' },
      { name: 'Convertible', parent: 'Motors' },
      { name: 'Motorcycles', parent: 'Motors' },
      { name: 'Heavy Vehicles', parent: 'Motors' },
      { name: 'Boats', parent: 'Motors' },
      { name: 'Number Plates', parent: 'Motors' },
      { name: 'Auto Accessories & Parts', parent: 'Motors' },

      // Mobiles
      { name: 'iPhone', parent: 'Mobiles' },
      { name: 'Samsung', parent: 'Mobiles' },
      { name: 'Xiaomi', parent: 'Mobiles' },
      { name: 'Huawei', parent: 'Mobiles' },
      { name: 'Nokia', parent: 'Mobiles' },
      { name: 'Tablets', parent: 'Mobiles' },
      { name: 'Wearables', parent: 'Mobiles' },
      { name: 'Mobile Accessories', parent: 'Mobiles' },

      // Properties
      { name: 'Apartment for Rent', parent: 'Properties' },
      { name: 'Villa for Rent', parent: 'Properties' },
      { name: 'Commercial for Rent', parent: 'Properties' },
      { name: 'Apartment for Sale', parent: 'Properties' },
      { name: 'Villa for Sale', parent: 'Properties' },
      { name: 'Commercial for Sale', parent: 'Properties' },
      { name: 'Land for Sale', parent: 'Properties' },
      { name: 'Multiple Units', parent: 'Properties' },

      // Electronics
      { name: 'Computers & Networking', parent: 'Electronics' },
      { name: 'Laptops', parent: 'Electronics' },
      { name: 'Cameras & Imaging', parent: 'Electronics' },
      { name: 'TV, Audio & Video', parent: 'Electronics' },
      { name: 'Video Games & Consoles', parent: 'Electronics' },
      { name: 'Home Appliances', parent: 'Electronics' },

      // Furniture & Garden
      { name: 'Home Furniture', parent: 'Furniture & Garden' },
      { name: 'Garden & Outdoor', parent: 'Furniture & Garden' },
      { name: 'Home Accessories', parent: 'Furniture & Garden' },
      { name: 'Rugs & Carpets', parent: 'Furniture & Garden' },
      { name: 'Curtains & Blinds', parent: 'Furniture & Garden' },

      // Jobs
      { name: 'Accounting', parent: 'Jobs' },
      { name: 'Admin & Secretarial', parent: 'Jobs' },
      { name: 'Arts & Design', parent: 'Jobs' },
      { name: 'Customer Service', parent: 'Jobs' },
      { name: 'Engineering', parent: 'Jobs' },
      { name: 'HR & Recruiting', parent: 'Jobs' },
      { name: 'IT & Telecom', parent: 'Jobs' },
      { name: 'Marketing & PR', parent: 'Jobs' },
      { name: 'Sales', parent: 'Jobs' },

      // Services
      { name: 'Domestic Services', parent: 'Services' },
      { name: 'Event Services', parent: 'Services' },
      { name: 'Movers & Packers', parent: 'Services' },
      { name: 'Web Development', parent: 'Services' },
      { name: 'Cleaning Services', parent: 'Services' },
      { name: 'Maintenance', parent: 'Services' },
      { name: 'Education & Tuition', parent: 'Services' },

      // Community
      { name: 'Activities', parent: 'Community' },
      { name: 'Artists', parent: 'Community' },
      { name: 'Car Lift', parent: 'Community' },
      { name: 'Childcare', parent: 'Community' },
      { name: 'Classes', parent: 'Community' },
      { name: 'Events', parent: 'Community' },
      { name: 'Freelancers', parent: 'Community' },
      { name: 'Lost & Found', parent: 'Community' },

      // Pets
      { name: 'Dogs', parent: 'Pets' },
      { name: 'Cats', parent: 'Pets' },
      { name: 'Birds', parent: 'Pets' },
      { name: 'Fish', parent: 'Pets' },
      { name: 'Pet Accessories', parent: 'Pets' },
      { name: 'Horses', parent: 'Pets' },

      // Fashion & Beauty
      { name: 'Clothing', parent: 'Fashion & Beauty' },
      { name: 'Shoes & Footwear', parent: 'Fashion & Beauty' },
      { name: 'Bags & Leather', parent: 'Fashion & Beauty' },
      { name: 'Jewelry & Watches', parent: 'Fashion & Beauty' },
      { name: 'Health & Beauty', parent: 'Fashion & Beauty' },

      // Hobbies, Sports & Kids
      { name: 'Musical Instruments', parent: 'Hobbies, Sports & Kids' },
      { name: 'Sports Equipment', parent: 'Hobbies, Sports & Kids' },
      { name: 'Tickets & Vouchers', parent: 'Hobbies, Sports & Kids' },
      { name: 'Toys & Games', parent: 'Hobbies, Sports & Kids' },
      { name: 'Antiques & Collectibles', parent: 'Hobbies, Sports & Kids' },
      { name: 'Books', parent: 'Hobbies, Sports & Kids' }
    ];

    console.log("Seeding Sub-Categories...");
    for (const sub of subCats) {
      // Find parent category
      const parentCat = await strapi.documents('api::category.category').findFirst({
        filters: { name: sub.parent }
      });

      if (parentCat) {
        // Check if sub-category exists
        const existingSub = await strapi.documents('api::sub-category.sub-category').findFirst({
          filters: { name: sub.name }
        });

        if (!existingSub) {
          console.log(`Creating Sub-Category: ${sub.name} -> ${sub.parent}`);
          await strapi.documents('api::sub-category.sub-category').create({
            data: {
              name: sub.name,
              category: parentCat.documentId // Use documentId for relations in v5
            },
            status: 'published'
          });
        } else if (!existingSub.publishedAt) {
          console.log(`Publishing Sub-Category: ${sub.name}`);
          await strapi.documents('api::sub-category.sub-category').publish({
            documentId: existingSub.documentId,
            status: 'published'
          });
        }
      }
    }
    console.log("Sub-Categories synced.");

    // 4. Seed initial products if absolutely empty
    const productCount = await strapi.db.query('api::product.product').count();
    if (productCount === 0) {
      console.log("Seeding initial product data...");
      const motors = await strapi.documents('api::category.category').findFirst({ filters: { name: 'Motors' } });

      await strapi.documents('api::product.product').create({
        data: {
          title: 'Mercedes Benz C-Class 2024',
          slug: 'mercedes-benz-c-class-2024-' + Math.random().toString(36).substring(2, 8),
          price: 150000,
          description: 'Brand new, GCC Specs, 0KM.',
          city: 'Dubai',
          phone: '+971500000000',
          category: motors?.documentId,
        },
        status: 'published'
      });
      console.log("Seeding completed!");
    }
  },
};
