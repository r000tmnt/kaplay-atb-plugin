# KAPLAY Plugin Template

A minimal [**KAPLAY.js**](https://kaplayjs.com) plugin template for creating and
publishing plugins.

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

Your plugin code is on `src/plugin.js`. To understand more about KAPLAY plugins 
[read this guide](https://kaplayjs.com/guides/plugins/).

## Testing and building

The `test/game.js` file has a KAPLAY game with your plugin imported, you can test 
here how your plugin is working.

When you think you have finished your masterpiece, you can build it with:

```sh
npm run build
```

Then, after selecting a name, you can publish it using:

```sh
npm publish
```

For your plugin name, we recommend using `kaplay-` with the plugin name,
for example:

- `kaplay-matter`
- `kaplay-box2d`
- `kaplay-poki`

etc.