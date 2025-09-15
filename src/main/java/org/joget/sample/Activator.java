package org.joget.sample;

import java.util.ArrayList;
import java.util.Collection;
import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceRegistration;
import org.joget.apps.app.service.AppPluginUtil;

public class Activator implements BundleActivator {

    protected Collection<ServiceRegistration> registrationList;

    public void start(BundleContext context) {
        registrationList = new ArrayList<ServiceRegistration>();

        // Register the UI Page Component (palette draggable component)
        SliderPageComponent sliderPage = new SliderPageComponent();
        registrationList.add(context.registerService(org.joget.plugin.base.Plugin.class.getName(), sliderPage, null));
        // Additionally register under PageComponent interface to aid discovery in some DX builds
        try {
            registrationList.add(context.registerService(org.joget.apps.userview.model.PageComponent.class.getName(), sliderPage, null));
        } catch (Throwable t) {
            // ignore if interface signature is not present in this build
        }

        // Register the Userview injector (runs script in userview navigation/sidebar)
        SliderUserviewInjector userviewInjector = new SliderUserviewInjector();
        registrationList.add(context.registerService(org.joget.plugin.base.Plugin.class.getName(), userviewInjector, null));
        try {
            registrationList.add(context.registerService(org.joget.apps.userview.model.UserviewMenu.class.getName(), userviewInjector, null));
        } catch (Throwable t) {
            // ignore if interface signature is not present
        }
    }

    public void stop(BundleContext context) {
        for (ServiceRegistration registration : registrationList) {
            registration.unregister();
        }
    }
}