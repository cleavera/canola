import { CompanyName, CompanyNameRepository } from '@canola/domain';
import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    public company: Promise<CompanyName>;

    constructor() {
        this.company = new CompanyNameRepository().getOwn();
    }
}
