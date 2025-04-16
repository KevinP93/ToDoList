import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css'
})
export class TodoComponent implements OnInit {

  todoTasks: string[] = [];
  doneTasks: string[] = [];
  newTask = '';
  prenom: string | null = null;

  ngOnInit(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const saved = JSON.parse(localStorage.getItem('tasks-dnd') || '{}');
        this.todoTasks = saved.todo || [];
        this.doneTasks = saved.done || [];

        const storedPrenom = localStorage.getItem('prenom');
        if (storedPrenom) {
          this.prenom = storedPrenom;
        } else {
          const p = prompt("Quel est ton prénom ?");
          if (p) {
            this.prenom = p;
            localStorage.setItem('prenom', p);
          }
        }
      } catch (e) {
        console.error('Erreur de lecture localStorage', e);
      }
    }
  }

  addTask() {
    if (this.newTask.trim()) {
      this.todoTasks.push(this.newTask.trim());
      this.newTask = '';
      this.save();
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) return;

    const prev = event.previousContainer.data;
    const curr = event.container.data;

    const [movedItem] = prev.splice(event.previousIndex, 1);
    curr.splice(event.currentIndex, 0, movedItem);
    this.save();
  }

  save() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('tasks-dnd', JSON.stringify({
        todo: this.todoTasks,
        done: this.doneTasks
      }));
    }
  }

  deleteDroppedTask(event: CdkDragDrop<any>) {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const previousList = event.previousContainer.data as string[];
      previousList.splice(event.previousIndex, 1);
      this.save();
    }
  }
}
