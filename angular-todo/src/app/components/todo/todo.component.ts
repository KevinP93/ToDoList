import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

interface Task {
  text: string;
  priority: 'low' | 'normal' | 'high';
}

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css'
})
export class TodoComponent implements OnInit {

  editedPriority: 'low' | 'normal' | 'high' = 'normal';
  emptyTaskList: Task[] = [];
  newTaskPriority: 'low' | 'normal' | 'high' = 'normal';
  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  doneTasks: Task[] = [];
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
      const task: Task = {
        text: this.newTask.trim(),
        priority: this.newTaskPriority
      };
      this.todoTasks.push(task);
      this.newTask = '';
      this.newTaskPriority = 'normal';
      this.save();
    }
  }
  

  drop(event: CdkDragDrop<Task[]>) {
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

  deleteDroppedTask(event: CdkDragDrop<Task[]>) {
    const previousList = event.previousContainer.data;
    previousList.splice(event.previousIndex, 1);
    this.save();
  }

  startEdit(list: 'todo' | 'inProgress' | 'done', index: number, value: Task) {
    this.editedTask = { list, index };
    this.editedText = value.text;
    this.editedPriority = value.priority;
  }
  

  confirmEdit() {
    if (!this.editedTask) return;
  
    const { list, index } = this.editedTask;
    const value = this.editedText.trim();
  
    if (value) {
      const updatedTask: Task = {
        text: value,
        priority: this.editedPriority
      };
  
      if (list === 'todo') this.todoTasks[index] = updatedTask;
      if (list === 'inProgress') this.inProgressTasks[index] = updatedTask;
      if (list === 'done') this.doneTasks[index] = updatedTask;
  
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

      this.projectNames[this.editingProjectIndex] = newName;

      const oldTasks = localStorage.getItem(`tasks-${oldName}`);
      if (oldTasks) {
        localStorage.setItem(`tasks-${newName}`, oldTasks);
        localStorage.removeItem(`tasks-${oldName}`);
      }

      if (this.currentProject === oldName) {
        this.currentProject = newName;
      }

      this.saveProjects();
      this.editingProjectIndex = null;
      this.editedProjectName = '';
      this.save();
    }
  }

  cancelProjectEdit() {
    this.editingProjectIndex = null;
    this.editedProjectName = '';
  }

  
}
