import React, { useState, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';

// Utilidades de fecha
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const formatKey = (d) => d.toISOString().slice(0,10); // YYYY-MM-DD
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
  const [formText, setFormText] = useState('');

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
    setOpen(true);
  };

  return (
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
                  <label className="form-field">
                    <span>Fecha</span>
                    <input type="date" value={formDate} onChange={e=>setFormDate(e.target.value)} />
                  </label>
                  <label className="form-field">
                    <span>Descripción</span>
                    <textarea rows={3} maxLength={200} value={formText} onChange={e=>setFormText(e.target.value)} placeholder="Ej: Llamar a cliente" />
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
                        <div key={r.id} className="reminder-pill" title={r.text}>
                          <span className="reminder-text">{r.text}</span>
                          <button className="reminder-del" onClick={(e)=>{e.stopPropagation(); deleteReminder(key,r.id);}} aria-label="Eliminar">×</button>
                        </div>
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
    </div>
  );
}

export default CalendarPage;
