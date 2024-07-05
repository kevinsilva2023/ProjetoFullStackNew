import { LoteService } from './../../../services/lote.service';
import { EventoService } from '@app/services/evento.service';
import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { Evento } from '@app/models/Evento';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Lote } from '@app/models/Lote';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
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
  eventoId: number;

  loteAtual = {id: 0, nome: '', indice: 0}
  modalAbrir: BsModalRef;

  get f(): any {
    return this.form.controls;
  }

  // só habilita o form de lotes, se eu estiver no modo de editar (put)
  get modoEditar(): boolean {
    return this.estadoSalvar === 'put'
  }

  // pega o meu formArrayName 
  get lotes(): FormArray {
    return this.form.get('lotes') as FormArray;
  }

  get presetDatePicker(): any {
    return {
      adaptivePosition: true,
      dateInputFormat: 'DD/MM/YYYY HH:mm',
      containerClass: 'theme-default',
      showWeekNumbers: false,
    };
  }


  constructor(
    private fbuilder: FormBuilder,
    private localeService: BsLocaleService,
    private router: ActivatedRoute,
    private eventoService: EventoService,
    private loteService: LoteService,
    private spiner: NgxSpinnerService,
    private toaster: ToastrService,
    private redirect: Router,
    private modalService: BsModalService
  ) {
    this.localeService.use('pt-br');
  }

  public carregarEvento(): void {
    // pegando o id em string e com o +, transforma em number
    this.eventoId = +this.router.snapshot.paramMap.get('id');

    if (this.eventoId !== null && this.eventoId !== 0) {
      this.spiner.show(); // inicio meu spiner

      this.estadoSalvar = 'put';

      // para nao ter que fazer dupla verificaçao, eu transformo já no parametro
      this.eventoService.getEventosById(this.eventoId).subscribe(
        (evento: Evento) => {
          this.evento = { ...evento };
          this.form.patchValue(this.evento);
          // jeito fácil
          // this.evento.lotes.forEach(lote => {
          //   this.lotes.push(this.criarLote(lote));
          // })
          this.carregarLotes();
        },
        (error: any) => {
          this.toaster.error('Erro ao tentar carregar Evento');
          console.log(error);
        },
      ).add(() => this.spiner.hide());
    }
  }

  // forma dificil de carregar os lotes
  public carregarLotes(): void {
    this.loteService.getLoteByEventoId(this.eventoId)
      .subscribe(
        (lotesRetorno: Lote[]) => {
          // dado um lote, para cada lote, eu quero que pegue, um lote e faça um push
           lotesRetorno.forEach(lote => {
            // o lote do parametro, é cada um dos lotes do retorno
            this.lotes.push(this.criarLote(lote));
              //ai eu dou um push no criarLote, ja passando os lote
           })
        },
        (error: any) => {
          this.toaster.error('Erro ao tentar carregar os Lotes');
          console.error(error);
        }
      )
      .add(() => this.spiner.hide());
  }

  ngOnInit() {
    this.carregarEvento();
    this.validador();
  }

  public validador(): void {
    this.form = this.fbuilder.group({
      tema: ['', [ Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
      local: ['', Validators.required],
      dataEvento: ['', Validators.required],
      qtdPessoas: ['', [Validators.required, Validators.max(1200)]],
      telefone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      imagemURL: ['', Validators.required],
      lotes: this.fbuilder.array([])
    });
  }

  // no meu formArrayName, eu dou um push
  adicionarLote(): void {
    this.lotes.push(this.criarLote({id: 0} as Lote));
  }

  criarLote(lote: Lote): FormGroup {
    return this.fbuilder.group({
      id: [lote.id],
      nome: [lote.nome, Validators.required],
      quantidade: [lote.quantidade, Validators.required], 
      preco: [lote.preco, Validators.required],
      dataInicio: [lote.dataInicio],
      dataFim: [lote.dataFim],
    });
  }

  public limpaForm(): void {
    return this.form.reset();
  }

  public cssValidator(campoForm: FormControl | AbstractControl): any {
    return {'is-invalid': campoForm.errors && campoForm.touched};
  }

  public voltarEventos(): void {
    this.redirect.navigate([`/eventos/lista`])
  }

  public salvarEvento(): void {

    const returnPost = 'Evento criado com sucesso!'
    const returnPut = 'Evento alterado com sucesso!'

    if (this.form.valid) {
      this.spiner.show();
      this.evento = this.estadoSalvar === 'post'
          // se o estado for post vai receber os eventos
          ? { ...this.form.value }
          // se for put vai os eventos, e um id
          : (this.evento = { id: this.evento.id, ...this.form.value });

      this.eventoService[this.estadoSalvar](this.evento).subscribe(
        (eventoRetorno: Evento) =>  {
          this.toaster.success( 
            this.estadoSalvar === 'post' 
                ? returnPost 
                : returnPut
              );
              // chama o form de lotes e passa já o id
              this.redirect.navigate([`eventos/detalhe/${eventoRetorno.id}`]);
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

    public salvarLotes(): void {
      // inicia o spiner.
      this.spiner.show();

      // se o meu form lotes controls for valido
      if(this.form.controls.lotes.valid) {

        // pego o methodo do meu service lotes e passo dois parametro para dar o push
        this.loteService.saveLote(this.eventoId, this.form.value.lotes)
          .subscribe(
            () => {
              this.toaster.success('Lotes salvos com Sucesso!');
              // this.lotes.reset();
            },
            (error) => {
              this.toaster.error('Error ao salvar lotes.');
              console.error(error);
            },
          )
          //fecho meu spnier
          .add(() => this.spiner.hide())
      }
    }

    public removerLote(template: TemplateRef<any>, indice: number): void {

      this.loteAtual.id = this.lotes.get(indice + '.id').value;
      this.loteAtual.nome = this.lotes.get(indice + '.nome').value;
      this.loteAtual.indice = indice;
      
      this.modalAbrir = this.modalService.show(template, { class: 'modal-sm' });
      
    }

    public confirmaDeleteLote(): void {
      this.modalAbrir.hide();
      this.spiner.show();

      this.loteService.deleteLote(this.eventoId, this.loteAtual.id)
        .subscribe(
          () => {
            this.toaster.success('Lote deletado com Sucesso!');
            this.lotes.removeAt(this.loteAtual.indice);
          },
          (error) => {
            this.toaster.error(`Error ao deletar lote ${this.loteAtual.nome}.`);
            console.error(error)
          }
        )
        .add(() => this.spiner.hide());
    }          
    
    public declineDeleteLote(): void {
      this.modalAbrir.hide();
    }

    public retornaTituloDoLote(nomeDoLote: string): any{
        return nomeDoLote === null || nomeDoLote === '' 
          ? 'Nome do Lote' 
          : nomeDoLote
    }
}
