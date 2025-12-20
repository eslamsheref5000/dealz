export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1338),
  app: {
    keys: env.array('APP_KEYS'),
  },
  url: env('PUBLIC_URL', 'https://shando5000-dealz.hf.space'),
});
