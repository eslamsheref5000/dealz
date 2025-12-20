export type Country = {
    id: string;
    name: string;
    currency: string;
    cities: string[];
    flag: string;
    phoneCode: string;
};

export const countries: Country[] = [
    {
        id: 'UAE',
        name: 'United Arab Emirates',
        currency: 'AED',
        cities: [
            'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah', 'Al Ain'
        ],
        flag: '🇦🇪',
        phoneCode: '+971'
    },
    {
        id: 'Egypt',
        name: 'Egypt',
        currency: 'EGP',
        cities: [
            'Cairo', 'Alexandria', 'Giza', 'Shubra El-Kheima', 'Port Said', 'Suez', 'Luxor', 'Mansoura',
            'El-Mahalla El-Kubra', 'Tanta', 'Asyut', 'Ismailia', 'Fayyum', 'Zagazig', 'Aswan', 'Damietta',
            'Damanhur', 'Minya', 'Beni Suef', 'Qena', 'Sohag', 'Hurghada', '6th of October', 'Shibin El Kom',
            'Banha', 'Kafr el-Sheikh', 'Arish', 'Mallawi', '10th of Ramadan', 'Bilbais', 'Marsa Matruh',
            'Idfu', 'Mit Ghamr', 'Al-Hamidiyya', 'Desouk', 'Qalyub', 'Abu Kabir', 'Kafr el-Dawwar',
            'Girga', 'Akhmim', 'Matareya'
        ],
        flag: '🇪🇬',
        phoneCode: '+20'
    },
    {
        id: 'KSA',
        name: 'Saudi Arabia',
        currency: 'SAR',
        cities: [
            'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Ta\'if', 'Tabuk', 'Buraydah',
            'Khamis Mushait', 'Abha', 'Al-Khobar', 'Jubail', 'Hail', 'Najran', 'Yanbu'
        ],
        flag: '🇸🇦',
        phoneCode: '+966'
    }
];
