import { Router } from '@angular/router';
import { Component, OnInit,TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

import { EventoService } from '@app/services/evento.service';
import { Evento } from '@app/models/Evento';

@Component({
  selector: 'app-evento-lista',
  templateUrl: './evento-lista.component.html',
  styleUrls: ['./evento-lista.component.scss']
})
export class EventoListaComponent implements OnInit {

  public eventos: Evento[] = [];
  public eventosFiltrados: Evento[] = [];
  public eventoName = '' as String
  public eventoId = 0 

  public exibirImagem: boolean = false;
  private filtroListado: string = '';

  public get filtroLista(): string {
    return this.filtroListado;
  }

  modalRef?: BsModalRef;

  public set filtroLista(value: string) {
    this.filtroListado = value;
    // se o filtro lista tiver valor, retorna o valor no method, caso nao retorna todo o array
    this.eventosFiltrados = this.filtroLista
      ? this.filtrarEventos(this.filtroLista)
      : this.eventos;
  }
  public filtrarEventos(filtrarPor: string): Evento[] {
    filtrarPor = filtrarPor.toLocaleLowerCase();
    return this.eventos.filter(
      (evento: { tema: string; local: string }) =>
        evento.tema.toLocaleLowerCase().indexOf(filtrarPor) !== -1 ||
        evento.local.toLocaleLowerCase().indexOf(filtrarPor) !== -1
    );
  }
  constructor(
    private eventoService : EventoService,
    private modalService : BsModalService,
    private toastr : ToastrService,
    private spinner : NgxSpinnerService,
    private router : Router,
  ) {}
  
  public ngOnInit(): void {
    this.spinner.show();
    this.carregarEventos();
  }

  public alterarImagem(): void {
    this.exibirImagem = !this.exibirImagem;
  }

  public carregarEventos(): void {
    this.eventoService.getEventos().subscribe(
     (_eventos: Evento[]) => {
        this.eventos = _eventos;
        this.eventosFiltrados = this.eventos;
      },
      (error: any) => {
        console.error(error);
        this.toastr.error('Erro ao Carregar os Eventos', 'Erro!');
      },
    ).add(() => this.spinner.hide());
  }

  openModal(event: any, template: TemplateRef<any>, eventoName: string, eventoId: number): void {

    // para nao funcionar o click da tr, e abrir a rota de editar
    event.stopPropagation()
    
    this.eventoName = eventoName
    this.eventoId = eventoId
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }

  confirm(): void {
    this.modalRef?.hide();
    this.spinner.show();
  
    this.eventoService.deleteEvento(this.eventoId).subscribe(
      (result: any) => {
          console.log('result')
          this.toastr.success(`Evento de ${this.eventoName} foi deletado com Sucesso.`, 'Deletado!');
          this.carregarEventos();
      },
      (error) => {
        this.toastr.error(`Erro ao deletar o evento ${this.eventoName}`)
        console.error(error)
      }
    ).add(() => this.spinner.hide());

  }

  decline(): void {
    this.modalRef?.hide();
  }

  detalheEvento(id: number): void {
    this.router.navigate([`eventos/detalhe/${id}`])
  }

}
