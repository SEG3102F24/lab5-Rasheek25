import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import {Employee} from "../model/employee";
import { map } from 'rxjs/operators';
import { Timestamp } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private employeesCollection: AngularFirestoreCollection<Employee>;
  employees$: Observable<Employee[]>;

  constructor(private firestore: AngularFirestore) {
    this.employeesCollection = firestore.collection<Employee>('employeeList');

    // Use snapshotChanges to transform the data
    this.employees$ = this.employeesCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Employee;
          const id = a.payload.doc.id;
          
          if (data.dateOfBirth instanceof Timestamp) {
            data.dateOfBirth = data.dateOfBirth.toDate(); 
          }

          console.log(data);

          return { id, ...data };
        })
      )
    );
  }

  get $(): Observable<Employee[]> {
    return this.employees$;
  }

  addEmployee(employee: Employee): Promise<void> {
    const id = this.firestore.createId();  
    return this.employeesCollection.doc(id).set(employee);
  }
}
