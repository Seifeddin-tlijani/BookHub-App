import { Component, OnInit } from '@angular/core';
import { Borrow } from '../../../core/models/borrow';
import { BorrowService } from '../../../core/services/borrow.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-borrow-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './borrow-list.component.html',
  styleUrl: './borrow-list.component.css'
})
export class BorrowListComponent implements OnInit {
  borrows: Borrow[] = [];

  constructor(private borrowService: BorrowService) {}

  ngOnInit(): void {
    this.borrowService.getBorrows().subscribe((data) => {
      this.borrows = data;
    });
  }

}
