import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {Student} from "../../models/student"
import { StudentServices } from "../../services/student.services";
import {DataService} from "../../services/data.services";

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css','../../res/fonts/util.css','../../res/vendor/bootstrap/css/bootstrap.min.css','../../res/fonts/font-awesome-4.7.0/css/font-awesome.min.css',
  '../../res/fonts/iconic/css/material-design-iconic-font.min.css','../../res/vendor/animate/animate.css','../../res/vendor/css-hamburgers/hamburgers.min.css', '../../res/vendor/animsition/css/animsition.min.css',
  '../../res/vendor/select2/select2.min.css','../../res/vendor/daterangepicker/daterangepicker.css']
})
export class FormComponent implements OnInit {

  //Com a variables globals, posem el Form (tipus FormGroup), i els missatges de validació.
  Form: FormGroup;
  validation_messages: any;
  subjectId: string;

  //Com a constructor, pasem els Services (on estaran implementades les funcions), el servei de Dades (per passar dades entre components),
  // el Router i el constructor de Form, formBuilder
  constructor(private router: Router,private studentService: StudentServices, private dataService:DataService,private formBuilder: FormBuilder) {
    this.Form = this.formBuilder.group({
      //Posem els diferents camps indicant si son requerits (Validators.required), i el patro
        name: new FormControl('', Validators.compose([
          Validators.required,
          Validators.pattern(/.{0,15}$/)])),

        address: new FormControl('', Validators.compose([
          Validators.pattern(/.{0,100}$/)])),

        phones: new FormControl('', Validators.compose([
          Validators.pattern(/.{0,100}$/)])),

        description: new FormControl('', Validators.compose([
          Validators.pattern(/.{0,100}$/)])),
        }


    )
  }

  ngOnInit() {
    this.dataService.clickedSubjectId.subscribe(subjectId => this.subjectId = subjectId)
    if(this.subjectId=="0")
    {
      this.router.navigateByUrl("/");
    }
    document.body.classList.add('bg-img');
    this.validation_messages = {
      //Per cada camp, podem possar un missatge de requeriment, de patro i d'error.
      'name': [
        { type: 'required', message: 'Nombre de Usuario: Requerido'},
        { type: 'pattern', message: 'Nombre de Usuario: Debe contener 15 carácteres como máximo' }
      ],
      'address': [
        { type: 'pattern', message: 'Dirección: Debe contener 100 carácteres como máximo' }
      ],
      'phones': [
        { type: 'pattern', message: 'Teléfonos:: Debe contener 100 carácteres como máximo' },
        { type: 'error', message: 'Teléfonos: Deben ir separados por comas'}
      ],
      'description': [
        { type: 'pattern', message: 'Descripcción: Debe contener 100 carácteres como máximo' },
        { type: 'error', message: 'Descripcción: Deben ir separados por comas'}
      ],
    }
  }

  peticioForm() {
    console.log("Operació d'afagir un estudiant realitzada al BackEnd:" + this.Form.value);
    //Creem el objecte que passarem a la petició, important fer-ho en el ordre del constructor
    var telf = this.Form.value.phones.split(",");
    var descr = this.Form.value.description.split(",");
    var phones = []//=[{name: String, address: {type: String}}]//:[{name: String, address: {type: String}}]
    for (let i = 0; i < telf.length; i++) {
      phones[i] = [{name: descr[i], address: telf[i]}]
    }

    //Faltaria passar tots els telefons, pero no em deixa per phones :(
    let student = new Student(this.Form.value.name, this.Form.value.address, phones[0])

    this.studentService.addStudent(this.subjectId, student)
      .subscribe(response => {
          console.log("Resposta del BackEnd" + response);
          //Podem filtrar per tots els codis 2XX
          if (response.status == 200) {
            //Operació Realitzada Correctament
            this.router.navigateByUrl("/");
          } else {
            //Error desconegut
            console.log("Error");
          }
        },
        err => {
          console.log("Error del BackEnd" + err);
          //Podem filtrar per tots els altres codis
          if (err.status == 409) {
            console.log("409");
            //Podem activar l'error d'un dels camps
            this.Form.get("name").setErrors({
              error: true
            });
          } else if (err.status == 500) {
            //Error desconegut
            console.log("Error");
          }
        });
  }

}
