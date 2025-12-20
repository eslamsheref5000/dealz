export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1338),
  app: {
    keys: env.array('APP_KEYS'),
  },
  url: 'https://shando5000-dealz.hf.space',
  proxy: true,
});
console.log('!!! SERVER CONFIG LOADED !!! URL:', 'https://shando5000-dealz.hf.space');
