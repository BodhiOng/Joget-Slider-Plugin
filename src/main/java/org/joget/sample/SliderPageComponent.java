package org.joget.sample;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

import org.joget.apps.app.service.AppUtil;
import org.joget.apps.userview.model.PageComponent;
import org.joget.plugin.property.model.PropertyEditable;

/**
 * A minimal Joget DX8 Page Component that injects a bundled JavaScript
 * (working_script.js) into the page and runs it after the page loads.
 *
 * The element only affects pages where it is placed in the UI Builder.
 */
public class SliderPageComponent extends PageComponent implements PropertyEditable {

    @Override
    public String getName() {
        return "org.joget.sample.SliderPageComponent";
    }

    @Override
    public String getVersion() {
        return "1.0";
    }

    @Override
    public String getDescription() {
        return "Custom UI Builder element that injects and executes a bundled JavaScript after page load.";
    }

    @Override
    public String getLabel() {
        return "Custom Script Runner";
    }

    @Override
    public String getPropertyOptions() {
        // Use AppUtil to resolve resource and i18n placeholders
        String json = AppUtil.readPluginResource(getClassName(), 
                "/properties/SliderPageComponent.json", null, true, 
                "messages/SliderPageComponent");
        return (json != null && !json.isEmpty()) ? json : "[]";
    }

    @Override
    public String getClassName() {
        return getClass().getName();
    }

    /**
     * Rendered output for runtime. Returns a small stub plus a script tag that
     * injects the bundled JS and runs it after load.
     */
    @Override
    public String render() {
        // Try to load via AppUtil (OSGi-aware), fallback to classpath
        String js = AppUtil.readPluginResource(getClassName(), 
                "/resources/js/working_script.js", null, false, null);
        if (js == null) {
            js = loadResourceAsString("/resources/js/working_script.js");
        }
        if (js == null) js = "";

        // Inject the script immediately; working_script.js is an IIFE with a self-guard.
        StringBuilder out = new StringBuilder();
        out.append("<div class=\"jw-slider-component\" style=\"display:none\"></div>\n");
        out.append("<script>console.log('SliderPageComponent: injecting working_script.js, bytes=' + " + js.length() + ");</script>\n");
        out.append("<script>\n");
        out.append(js);
        out.append("\n</script>\n");
        return out.toString();
    }

    // Utility to read a resource file into a String
    protected String loadResourceAsString(String path) {
        try (InputStream is = getClass().getResourceAsStream(path)) {
            if (is == null)
                return null;
            try (BufferedReader br = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = br.readLine()) != null) {
                    sb.append(line).append('\n');
                }
                return sb.toString();
            }
        } catch (IOException e) {
            return null;
        }
    }

    // Category and icon used by UI Builder palette
    @Override
    public String getCategory() {
        return "Custom";
    }

    @Override
    public String getIcon() {
        return "fa fa-code";
    }

    public String getRenderPage() {
        return "";
    }

    public boolean isHomePageSupported() {
        return false;
    }

    public String getDecoratedMenu() {
        return "";
    }

    public String getBuilderJavaScriptTemplate() {
        // Minimal drag HTML placeholder for the Page Builder palette
        return "{\"dragHtml\" : \"<div class='content-placeholder'></div>\"}";
    }

    public String render(String id, String cssClass, String style, String attributes, boolean isBuilder) {
        String inner;
        if (isBuilder) {
            inner = "<div class=\"content-placeholder\">" + getLabel() + "</div>";
        } else {
            inner = render();
        }
        return "<div " + attributes + " id=\"" + id + "\" class=\"" + cssClass + "\">" + style + inner + "</div>";
    }
}
