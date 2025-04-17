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
  inProgressTasks: string[] = [];
  doneTasks: string[] = [];
  newTask = '';
  prenom: string | null = null;
  editedTask: { list: 'todo' | 'inProgress' | 'done'; index: number } | null = null;
  editedText = '';
  menuOpen = false;
  currentProject = 'Projet 1';
  projectNames: string[] = [];
  newProjectName = '';
  editingProjectIndex: number | null = null;
  editedProjectName = '';

  ngOnInit(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      this.loadProjects();
      this.switchProject(this.projectNames[0]);
  
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
      localStorage.setItem(`tasks-${this.currentProject}`, JSON.stringify({
        todo: this.todoTasks,
        inProgress: this.inProgressTasks,
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

  startEdit(list: 'todo' | 'inProgress' | 'done', index: number, value: string) {
    this.editedTask = { list, index };
    this.editedText = value;
  }
  
  confirmEdit() {
    if (!this.editedTask) return;
  
    const { list, index } = this.editedTask;
    const value = this.editedText.trim();
  
    if (value) {
      if (list === 'todo') this.todoTasks[index] = value;
      if (list === 'inProgress') this.inProgressTasks[index] = value;
      if (list === 'done') this.doneTasks[index] = value;
      this.save();
    }
  
    this.cancelEdit();
  }
  
  cancelEdit() {
    this.editedTask = null;
    this.editedText = '';
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  
  loadProjects() {
    const savedProjects = JSON.parse(localStorage.getItem('projects') || '["Projet 1"]');
    this.projectNames = savedProjects;
  }
  
  saveProjects() {
    localStorage.setItem('projects', JSON.stringify(this.projectNames));
  }
  
  switchProject(name: string) {
    this.currentProject = name;
    this.loadTasks();
    this.menuOpen = false;
  }
  
  addProject() {
    const name = this.newProjectName.trim();
    if (name && !this.projectNames.includes(name)) {
      this.projectNames.push(name);
      this.saveProjects();
      this.switchProject(name);
      this.newProjectName = '';
    }
  }
  
  loadTasks() {
    const saved = JSON.parse(localStorage.getItem(`tasks-${this.currentProject}`) || '{}');
    this.todoTasks = saved.todo || [];
    this.inProgressTasks = saved.inProgress || [];
    this.doneTasks = saved.done || [];
  }

  startEditProject(index: number) {
    this.editingProjectIndex = index;
    this.editedProjectName = this.projectNames[index];
  }
  
  confirmProjectEdit() {
    if (
      this.editingProjectIndex !== null &&
      this.editedProjectName.trim() &&
      !this.projectNames.includes(this.editedProjectName.trim())
    ) {
      const oldName = this.projectNames[this.editingProjectIndex];
      const newName = this.editedProjectName.trim();
  
      // Renomme dans le tableau
      this.projectNames[this.editingProjectIndex] = newName;
  
      // Sauvegarde les donnees sous le nouveau nom
      const oldTasks = localStorage.getItem(`tasks-${oldName}`);
      if (oldTasks) {
        localStorage.setItem(`tasks-${newName}`, oldTasks);
        localStorage.removeItem(`tasks-${oldName}`);
      }
  
      // Met à jour le projet actif
      if (this.currentProject === oldName) {
        this.currentProject = newName;
      }
  
      this.saveProjects();
      this.editingProjectIndex = null;
      this.editedProjectName = '';
      this.save(); // Re-sauvegarder les tâches sous le nouveau nom
    }
  }
  
  cancelProjectEdit() {
    this.editingProjectIndex = null;
    this.editedProjectName = '';
  }
  
  
}
