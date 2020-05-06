import { CompanyName, CompanyNameRepository } from '@actoolkit/your-company';
import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    public title: string = 'age6';
    public company: Promise<CompanyName>;

    constructor() {
        this.company = new CompanyNameRepository().get();
    }
}
