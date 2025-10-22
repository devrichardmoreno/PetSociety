import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { LandingComponent } from './pages/landing-component/landing-component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, LandingComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('pet_society_front');
}
