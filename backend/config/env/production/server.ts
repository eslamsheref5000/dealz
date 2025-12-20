export default ({ env }) => ({
    url: 'https://shando5000-dealz.hf.space',
    proxy: true,
    app: {
        keys: env.array('APP_KEYS'),
    },
});
console.log('!!! PRODUCTION SERVER CONFIG LOADED !!!');
