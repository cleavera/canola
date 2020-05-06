import { BrowserRequest } from '@actoolkit/browser';
import { INJECTOR, REQUEST } from '@actoolkit/core';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        AppRoutingModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor() {
        INJECTOR.setValue(REQUEST, new BrowserRequest('http://www.bushtarion.com'));
    }
}
