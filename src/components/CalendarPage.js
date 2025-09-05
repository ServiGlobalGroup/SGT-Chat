import React, { useState, useMemo, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

// Utilidades de fecha
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
// Formato local YYYY-MM-DD evitando desplazamiento por zona horaria
const pad = n => String(n).padStart(2,'0');
const formatKey = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const isToday = (d) => {
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
};

function buildMonthMatrix(baseDate, weekStartsOn = 1) { // 1 = lunes
  const first = startOfMonth(baseDate);
  const firstDay = (first.getDay() + 7 - weekStartsOn) % 7; // offset
  const daysInMonth = new Date(first.getFullYear(), first.getMonth()+1,0).getDate();
  const cells = [];
  // días previos
  for (let i=0; i<firstDay; i++) {
    const date = new Date(first.getFullYear(), first.getMonth(), i - firstDay + 1);
    cells.push({ date, outside: true });
  }
  // mes actual
  for (let d=1; d<=daysInMonth; d++) {
    const date = new Date(first.getFullYear(), first.getMonth(), d);
    cells.push({ date, outside: false });
  }
  // completar hasta múltiplo de 7
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length-1].date;
    const date = new Date(last.getFullYear(), last.getMonth(), last.getDate()+1);
    cells.push({ date, outside: true });
  }
  // agrupar semanas
  const weeks = [];
  for (let i=0; i<cells.length; i+=7) weeks.push(cells.slice(i,i+7));
  return weeks;
}

function CalendarPage() {
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [reminders, setReminders] = useState({}); // key => [{id,text,time}]
  const [open, setOpen] = useState(false);
  const [formDate, setFormDate] = useState(formatKey(new Date()));
  const [pickerMonth, setPickerMonth] = useState(startOfMonth(new Date()));
  const [formText, setFormText] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null); // {dateKey,id,text}

  const matrix = useMemo(() => buildMonthMatrix(month), [month]);
  const monthName = month.toLocaleDateString('es-ES', { month:'long' });
  const yearNum = month.getFullYear();

  const weekDays = ['L','M','X','J','V','S','D'];

  const addReminder = () => {
    if (!formText.trim()) return;
    setReminders(prev => {
      const arr = prev[formDate] ? [...prev[formDate]] : [];
      arr.push({ id: Date.now(), text: formText.trim() });
      return { ...prev, [formDate]: arr };
    });
    setFormText('');
    setOpen(false);
  };

  const deleteReminder = (dateKey, id) => {
    setReminders(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].filter(r => r.id !== id)
    }));
  };

  const openAddForDay = (date) => {
    setFormDate(formatKey(date));
    setFormText('');
    setPickerMonth(startOfMonth(date));
    setOpen(true);
  };

  // Sincroniza el mes del selector cuando se abre manualmente
  useEffect(()=>{
    if (open) {
      const d = new Date(formDate);
      if (!isNaN(d)) setPickerMonth(startOfMonth(d));
    }
  },[open, formDate]);

  const pickerMatrix = useMemo(()=> buildMonthMatrix(pickerMonth),[pickerMonth]);
  const pickerMonthLabel = pickerMonth.toLocaleDateString('es-ES', { month:'long', year:'numeric' });

  return (
  <Tooltip.Provider delayDuration={300} skipDelayDuration={100}>
  <div className="page-container fade-in calendar-page">
      <header className="page-header calendar-header">
        <div className="cal-left">
          <button className="cal-nav-btn" onClick={() => setMonth(m => addMonths(m,-1))} aria-label="Mes anterior"><ChevronLeft size={18} /></button>
          <button className="cal-nav-btn" onClick={() => setMonth(m => addMonths(m,1))} aria-label="Mes siguiente"><ChevronRight size={18} /></button>
        </div>
        <div className="cal-center">
          <span className="cal-month">{monthName.charAt(0).toUpperCase()+monthName.slice(1)}</span>
          <span className="cal-year">{yearNum}</span>
        </div>
        <div className="page-actions cal-actions">
          <button className="cal-today-btn" onClick={() => setMonth(startOfMonth(new Date()))}>Hoy</button>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <button className="btn-primary btn-icon" onClick={() => openAddForDay(new Date())}><Plus size={16}/> Añadir recordatorio</button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="dialog-overlay" />
              <Dialog.Content className="dialog-content reminder-dialog" aria-label="Nuevo recordatorio">
                <div className="dialog-header">
                  <Dialog.Title>Nuevo recordatorio</Dialog.Title>
                  <Dialog.Close asChild>
                    <button className="dialog-close" aria-label="Cerrar"><X size={16}/></button>
                  </Dialog.Close>
                </div>
                <div className="dialog-body">
                  <div className="form-field">
                    <span>Fecha</span>
                    <div className="mini-date-picker" role="group" aria-label="Selector de fecha">
                      <div className="mdp-header">
                        <button type="button" className="mdp-nav" onClick={()=>setPickerMonth(m=>addMonths(m,-1))} aria-label="Mes anterior">‹</button>
                        <span className="mdp-title">{pickerMonthLabel.charAt(0).toUpperCase()+pickerMonthLabel.slice(1)}</span>
                        <button type="button" className="mdp-nav" onClick={()=>setPickerMonth(m=>addMonths(m,1))} aria-label="Mes siguiente">›</button>
                      </div>
                      <div className="mdp-weekdays" aria-hidden="true">
                        {['L','M','X','J','V','S','D'].map(d=> <div key={d}>{d}</div>)}
                      </div>
                      <div className="mdp-grid">
                        {pickerMatrix.map((week, wi)=>(
                          <div key={wi} className="mdp-week">
                            {week.map(cell=>{
                              const key = formatKey(cell.date);
                              const selected = key === formDate;
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  className={`mdp-day ${cell.outside?'outside':''} ${selected?'selected':''} ${isToday(cell.date)?'today':''}`}
                                  onClick={()=>{ if(!cell.outside){ setFormDate(key); } }}
                                  aria-pressed={selected}
                                  tabIndex={cell.outside?-1:0}
                                >{cell.date.getDate()}</button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <label className="form-field">
                    <span>Descripción</span>
                    <textarea rows={3} maxLength={200} value={formText} onChange={e=>setFormText(e.target.value)} placeholder="Ej: Llamar a cliente" />
                    <div className="char-counter">{formText.length}/200</div>
                  </label>
                </div>
                <div className="dialog-footer">
                  <button className="btn-secondary" onClick={()=>setOpen(false)}>Cancelar</button>
                  <button className="btn-primary" disabled={!formText.trim()} onClick={addReminder}>Guardar</button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </header>
      <div className="page-content calendar-content">
        <div className="calendar-grid" role="grid">
          <div className="calendar-weekdays" role="row">
            {weekDays.map(d => <div key={d} className="calendar-weekday" role="columnheader">{d}</div>)}
          </div>
          {matrix.map((week, wi) => (
            <div key={wi} className="calendar-week" role="row">
              {week.map(cell => {
                const key = formatKey(cell.date);
                const dayRem = reminders[key] || [];
                return (
                  <div
                    key={key}
                    role="gridcell"
                    className={`calendar-day ${cell.outside ? 'outside' : ''} ${isToday(cell.date)?'today':''} ${dayRem.length?'has-reminders':''}`}
                    onDoubleClick={() => !cell.outside && openAddForDay(cell.date)}
                  >
                    <div className="calendar-day-number" onClick={() => !cell.outside && openAddForDay(cell.date)}>{cell.date.getDate()}</div>
                    <div className="calendar-reminders">
                      {dayRem.slice(0,3).map(r => (
                        <Tooltip.Root key={r.id}>
                          <Tooltip.Trigger asChild>
                            <div className="reminder-pill">
                              <span className="reminder-text">{r.text}</span>
                              <button className="reminder-del" onClick={(e)=>{e.stopPropagation(); setPendingDelete({ dateKey:key, id:r.id, text:r.text });}} aria-label="Eliminar">×</button>
                            </div>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content className="tooltip-content" side="top" sideOffset={8} align="center">
                              <div className="tooltip-header"><strong>Recordatorio</strong></div>
                              <div className="tooltip-description">{r.text}</div>
                              <Tooltip.Arrow className="tooltip-arrow" />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      ))}
                      {dayRem.length > 3 && <div className="reminder-more" title={dayRem.map(r=>r.text).join('\n')}>+{dayRem.length-3}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
  { /* Texto de ayuda eliminado a petición del usuario */ }
      </div>
  <AlertDialog.Root open={!!pendingDelete} onOpenChange={(v)=>{ if(!v) setPendingDelete(null); }}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="alert-overlay" />
          <AlertDialog.Content className="alert-content" aria-label="Confirmar eliminación de recordatorio">
            <div className="alert-header">
              <AlertDialog.Title className="alert-title">Eliminar recordatorio</AlertDialog.Title>
              <AlertDialog.Cancel asChild>
                <button className="alert-close" aria-label="Cerrar"><X size={14}/></button>
              </AlertDialog.Cancel>
            </div>
            <div className="alert-body">
              <p className="alert-text">¿Seguro que deseas eliminar este recordatorio?</p>
              {pendingDelete && <p className="alert-quote">“{pendingDelete.text.slice(0,120)}{pendingDelete.text.length>120?'…':''}”</p>}
            </div>
            <div className="alert-footer">
              <AlertDialog.Cancel asChild>
                <button className="btn-secondary btn-sm">Cancelar</button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button className="btn-danger btn-sm" onClick={()=>{ if(pendingDelete){ deleteReminder(pendingDelete.dateKey, pendingDelete.id); setPendingDelete(null);} }}>Eliminar</button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
  </div>
  </Tooltip.Provider>
  );
}

export default CalendarPage;
