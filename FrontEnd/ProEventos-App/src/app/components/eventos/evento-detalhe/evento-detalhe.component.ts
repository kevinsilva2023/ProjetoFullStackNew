import { EventoService } from '@app/services/evento.service';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { Evento } from '@app/models/Evento';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Lote } from '@app/models/Lote';

@Component({
  selector: 'app-evento-detalhe',
  templateUrl: './evento-detalhe.component.html',
  styleUrls: ['./evento-detalhe.component.scss'],
})
export class EventoDetalheComponent implements OnInit {
  evento = {} as Evento;
  form: FormGroup;
  isAnimated: any;
  estadoSalvar = 'post';
  
  get f(): any {
    return this.form.controls;
  }

  get presetDatePicker(): any {
    return {
      adaptivePosition: true,
      dateInputFormat: 'DD/MM/YYYY HH:mm',
      containerClass: 'theme-default',
      showWeekNumbers: false,
    };
  }

  get lotes(): FormArray {
    return this.form.get('lotes') as FormArray;
  }

  constructor(
    private fbuilder: FormBuilder,
    private localeService: BsLocaleService,
    private router: ActivatedRoute,
    private eventoService: EventoService,
    private spiner: NgxSpinnerService,
    private toaster: ToastrService,
    private redirect: Router
  ) {
    this.localeService.use('pt-br');
  }

  public carregarEvento(): void {
    // pegando o id em string e com o +, transforma em number
    const eventoIdParam = this.router.snapshot.paramMap.get('id');

    // porém, se for nulo, vai ser 0, então
    if (eventoIdParam !== null) {
      this.spiner.show(); // inicio meu spiner

      this.estadoSalvar = 'put';

      // para nao ter que fazer dupla verificaçao, eu transformo já no parametro
      this.eventoService.getEventosById(+eventoIdParam).subscribe(
        (evento: Evento) => {
          this.evento = { ...evento };
          this.form.patchValue(this.evento);
          this.spiner.hide();
        },
        (error: any) => {
          this.spiner.hide(); // fecho meu spiner
          this.toaster.error('Erro ao tentar carregar Evento');
          console.log(error);
        },
        () => this.spiner.hide()
      );
    }
  }

  ngOnInit() {
    this.validador();
    this.carregarEvento();
  }

  public validador(): void {
    this.form = this.fbuilder.group({
      tema: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(50),
        ],
      ],
      local: ['', Validators.required],
      dataEvento: ['', Validators.required],
      qtdPessoas: ['', [Validators.required, Validators.max(1200)]],
      telefone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      imagemURL: ['', Validators.required],
      lotes: this.fbuilder.array([])
    });
  }

  adicionarLote(): void {
    this.lotes.push(this.criarLote({id: 0} as Lote));
  }

  criarLote(lote: Lote): FormGroup {
    return this.fbuilder.group({
      id: [lote.id, Validators.required],
      nome: [lote.nome, Validators.required],
      preco: [lote.preco, Validators.required],
      dataInicio: [lote.dataInicio, Validators.required],
      dataFim: [lote.dataFim, Validators.required],
      quantidade: [lote.quantidade, Validators.required] 
    })
  }

  public limpaForm(): void {
    return this.form.reset();
  }

  public voltarEventos(): void {
    this.redirect.navigate([`/eventos/lista`])
  }

  public salvarAlteracao(): void {

    const returnPost = 'Evento criado com sucesso!'
    const returnPut = 'Evento alterado com sucesso!'


    this.spiner.show();
    if (this.form.valid) {
      this.evento = this.estadoSalvar === 'post'
          // se o estado for post vai receber os eventos
          ? { ...this.form.value }
          // se for put vai os eventos, e um id
          : (this.evento = { id: this.evento.id, ...this.form.value });

      this.eventoService[this.estadoSalvar](this.evento).subscribe(
        () =>  {
          this.toaster.success( 
            this.estadoSalvar === 'post' 
                ? returnPost 
                : returnPut
          ), this.voltarEventos();
        },
        (error: any) => {
          console.error(error);
          this.spiner.hide();
          this.toaster.error('Erro ao salvar o envento.');
        },
        () => this.spiner.hide()
      );
    } 
  }



}
