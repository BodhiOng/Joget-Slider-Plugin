# Joget Slider Plugin

A Joget DX8 plugin that adds a side slider functionality to view content within the Joget UI.

## Description

The Slider Plugin adds a sliding panel to the right side of your Joget application. It allows users to view content (like forms or other resources) without leaving the current page. This is particularly useful for viewing and editing data without disrupting the main workflow.

## Features

- Side slider panel that can be opened, minimized, or closed
- Tabbed interface to manage multiple open resources
- Handles websites that block embedding with fallback options (open in new tab or popup)
- Responsive design that works on various screen sizes
- Automatically intercepts "Edit" links in data lists to open content in the slider

## Installation

1. Build the plugin using Maven:
   ```
   mvn clean install
   ```

2. The plugin JAR file will be generated in the `target` directory

3. Upload the JAR file to your Joget DX9 installation:
   - Log in to Joget as an administrator
   - Go to Manage > Plugins
   - Click on "Upload Plugin"
   - Select the JAR file and upload

## Usage

### Method 1: Using Custom HTML

1. In your Joget app, go to the Userview Builder

2. Create or edit a userview

3. Add a "Custom HTML" element to the page where you want the slider

4. In the Custom HTML settings, add the following code:
   ```html
   <div id="sliderPluginContainer"></div>
   <script>
   loadPlugin("org.joget.sample.SliderPlugin", "sliderPluginContainer", {
     "enableSlider": "true",
     "sliderWidth": "50",
     "maxWidth": "980",
     "minWidth": "360"
   });
   </script>
   ```

5. The slider will be automatically added to your page and will intercept clicks on "Edit" and "Add" links in data lists

6. You can customize the properties as needed:
   - `enableSlider`: Set to "true" to enable the slider, "false" to disable
   - `sliderWidth`: Width of the slider as a percentage (e.g., "50" for 50%)
   - `maxWidth`: Maximum width in pixels (e.g., "980" for 980px)
   - `minWidth`: Minimum width in pixels (e.g., "360" for 360px)

### Method 2: Using Userview Builder

1. In your Joget app, go to the Userview Builder

2. Create or edit a userview

3. Add a "Custom Content" element to the page where you want the slider

4. In the Custom Content settings, select "Plugin" as the content type

5. Choose "Slider Plugin" from the plugin dropdown

6. In the Properties panel, you should see the following configuration options:
   - **Enable Slider**: Check this to enable the slider functionality
   - **Slider Width (%)**: Set the width of the slider panel as a percentage (default: 50)
   - **Maximum Width (px)**: Set the maximum width in pixels (default: 980)
   - **Minimum Width (px)**: Set the minimum width in pixels (default: 360)
   
   If you don't see these properties, try refreshing the page or reinstalling the plugin.

7. Save and publish your app

8. The slider will be automatically added to the specified pages

9. By default, the plugin intercepts clicks on "Edit" and "Add" links in data lists and opens the content in the slider

## Customization

The plugin can be customized by modifying the JavaScript code in the `slider.js` file located in the `src/main/resources/resources/js/` directory. You can adjust the styling, behavior, and event handling to suit your specific requirements.

## Troubleshooting

### Verifying Script Injection

If the slider isn't appearing on your page, you can check if the script is being injected properly:

1. Open your browser's developer console (F12 or right-click > Inspect)
2. Look for log messages starting with `SliderPlugin:` 
3. You should see messages like:
   - `SliderPlugin: Script injection started`
   - `SliderPlugin: JavaScript file loaded`
   - `SliderPlugin: IIFE started`
   - `SliderPlugin: First injection, continuing`
   - `SliderPlugin: Using configuration: {...}`

If you don't see these messages, the script may not be loading correctly.

### Server Logs

Check your Joget server logs for messages like:
- `SliderPlugin: Executing plugin with properties: {...}`
- `SliderPlugin: Injecting JavaScript with config: {...}`

### Common Issues

1. **Plugin not appearing in the Custom Content dropdown**: Make sure the plugin is properly installed and activated in Joget.

2. **Script not injecting**: Try adding the plugin using the Custom HTML method with the explicit loadPlugin call.

3. **Slider not intercepting clicks**: The slider uses event delegation to intercept clicks on data list items. Make sure your data list has the expected structure and IDs.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or contributions, please open an issue in the GitHub repository or contact the plugin maintainer.