import { Component, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from './components/headers/default-header/default-header';
import { HeaderAdmin } from './components/headers/admin-header/header-admin';
import { Footer } from './components/footer/footer';
import { filter, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HeaderDoctor } from "./components/headers/doctor-header/header-doctor";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, HeaderAdmin, Footer, CommonModule, HeaderDoctor],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title: WritableSignal<string> = signal('pet_society_front');
  public headerType: WritableSignal<string> = signal('default');

  public constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => {
        let route = this.activatedRoute;
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      map(route => route.snapshot.data['headerType'] || 'none')
    ).subscribe(headerType => {
      this.headerType.set(headerType);
    });
  }
}