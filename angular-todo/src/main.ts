import { provideRouter } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';



bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes)]
});
