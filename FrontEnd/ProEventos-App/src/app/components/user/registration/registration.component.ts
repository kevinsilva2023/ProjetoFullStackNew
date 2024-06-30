import { Component, OnInit } from '@angular/core';
import { AbstractControl, AbstractControlOptions, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidatorField } from '@app/helpers/ValidatorField';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  formCadastro: FormGroup;
  
  get f(): any {
    return this.formCadastro.controls;
  }

  constructor(
    private formBuilder : FormBuilder
  ) { }

  ngOnInit() {
    this.validadorCadastro();
  }


  public validadorCadastro(): void {

    const formOptions: AbstractControlOptions = {
      validators: ValidatorField.MustMatch('senha', 'confirmarSenha')
    };

    this.formCadastro = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      sobrenome: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [ Validators.required, Validators.email]],
      user: ['', [Validators.required, Validators.minLength(5)]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', Validators.required],
    }, formOptions);
  }

}
