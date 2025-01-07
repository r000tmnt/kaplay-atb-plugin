# KAPLAY Plugin Template

A minimal and clean [**KAPLAY.js**](https://kaplayjs.com) plugin template for 
creating and publishing plugins.

> If you're reading the `kaplay-hi-plugin-ts` on NPM, this is only a demo plugin,
> it will add a `hi()` function to log `hi`.

## Download template

You can download the template using **"Download ZIP"** option in **GitHub**,
you can also use git:

```sh
git clone https://github.com/kaplayjs/kaplay-plugin-template
```

Navigate to the folder and install dependencies:

```sh
cd kaplay-plugin-template
npm install
```

## Creating your plugin

Your plugin code is in `src/plugin.js`. To understand more about KAPLAY plugins, 
[read this guide](https://kaplayjs.com/guides/plugins/).

## Testing and building

`test/game.js` file imports your plugin that you can test with a KAPLAY game. 
You can then build your masterpiece with:

```sh
npm run build
```

After selecting a name, you can publish it using:

```sh
npm publish
```

We recommend adding kaplay- before plugin names. For example:

- `kaplay-matter`
- `kaplay-box2d`
- `kaplay-poki`

etc.