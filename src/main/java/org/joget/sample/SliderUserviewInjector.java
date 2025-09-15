package org.joget.sample;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

import org.joget.apps.app.service.AppUtil;
import org.joget.apps.userview.model.UserviewMenu;
import org.joget.plugin.property.model.PropertyEditable;

/**
 * Userview Menu plugin that injects working_script.js on Userview pages where it's placed.
 * Shows a small placeholder in builder; injects the script at runtime.
 */
public class SliderUserviewInjector extends UserviewMenu implements PropertyEditable {

    @Override
    public String getName() {
        return "org.joget.sample.SliderUserviewInjector";
    }

    @Override
    public String getLabel() {
        return "Custom Script Runner (Userview)";
    }

    @Override
    public String getDescription() {
        return "Injects and executes a bundled JavaScript on this Userview menu page after load.";
    }

    @Override
    public String getVersion() {
        return "1.0";
    }

    @Override
    public String getCategory() {
        return "Custom";
    }

    @Override
    public String getIcon() {
        return "fa fa-code";
    }

    @Override
    public String getClassName() {
        return getClass().getName();
    }

    @Override
    public String getPropertyOptions() {
        // Return a minimal, strict JSON array so the builder can safely append its own sections.
        return "[{" +
               "\"title\": \"General\"," +
               "\"properties\": [" +
               "  { \"name\": \"id\", \"label\": \"ID\", \"type\": \"textfield\" }," +
               "  { \"name\": \"note\", \"label\": \"Note\", \"type\": \"label\", \"value\": \"Injects working_script.js on this Userview menu page.\" }" +
               "]" +
               "}]";
    }

    // For UserviewMenu, return decorated menu HTML (we'll use this as injection point)
    @Override
    public String getDecoratedMenu() {
        boolean isBuilder = Boolean.parseBoolean(getRequestParameterString("isBuilder"));
        if (isBuilder) {
            return "<div class=\"content-placeholder\">" + getLabel() + "</div>";
        }
        String js = AppUtil.readPluginResource(getClassName(),
                "/resources/js/working_script.js", null, false, null);
        if (js == null) {
            js = loadResourceAsString("/resources/js/working_script.js");
        }
        if (js == null) js = "";
        StringBuilder out = new StringBuilder();
        out.append("<div class=\"jw-slider-component\" style=\"display:none\"></div>\n");
        out.append("<script>console.log('SliderUserviewInjector: injecting working_script.js, bytes=' + " + js.length() + ");</script>\n");
        out.append("<script>\n");
        out.append(js);
        out.append("\n</script>\n");
        return out.toString();
    }

    @Override
    public String getRenderPage() {
        // Not using a JSP template; we return HTML directly via getDecoratedMenu
        return "";
    }

    @Override
    public boolean isHomePageSupported() {
        return false;
    }

    // Utility to read a resource file into a String
    protected String loadResourceAsString(String path) {
        try (InputStream is = getClass().getResourceAsStream(path)) {
            if (is == null) return null;
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
}
