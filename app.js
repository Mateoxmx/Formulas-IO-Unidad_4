const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

// Small MathML helpers keep the equations local, selectable and accessible.
function notation(value) {
  if (value.includes('<m')) return value;
  const tokens = value.match(/(?:TIC|PRO|[A-Za-z])(?:_[A-Za-z0-9]+)?\*?|\d+(?:\.\d+)?|[^\s]/g) || [];
  return '<mrow>' + tokens.map(token => {
    if (/^[A-Za-z]/.test(token)) {
      const [base, subscript] = token.replace('*', '').split('_');
      let node = `<mi${base.length > 1 ? ' mathvariant="normal"' : ''}>${base}</mi>`;
      if (subscript) node = `<msub>${node}<mtext>${subscript}</mtext></msub>`;
      if (token.endsWith('*')) node = `<msup>${node}<mo>*</mo></msup>`;
      return node;
    }
    return /^\d/.test(token) ? `<mn>${token}</mn>` : `<mo>${escapeHTML(token)}</mo>`;
  }).join('') + '</mrow>';
}
const row = (...values) => '<mrow>' + values.map(notation).join('') + '</mrow>';
const fraction = (top, bottom) => `<mfrac>${notation(top)}${notation(bottom)}</mfrac>`;
const root = value => `<msqrt>${notation(value)}</msqrt>`;
const square = value => `<msup>${notation(value)}<mn>2</mn></msup>`;
const textMath = value => `<mtext>${escapeHTML(value)}</mtext>`;
const equation = content => `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">${content}</math>`;

const commonSymbols = [
  ['d','Demanda por periodo.'], ['D','Demanda anual.'], ['Q','Unidades por pedido.'],
  ['K','Costo por colocar un pedido.'], ['c','Precio de compra por unidad.'], ['h','Costo por unidad almacenada y periodo.'],
  ['L','Tiempo de entrega.'], ['t*','Tiempo óptimo entre pedidos.'], ['N','Número de pedidos por año.'],
  ['T','Costo total por periodo.'], ['I','Tasa de almacenamiento en decimal.'], ['*','Indica un valor óptimo.']
];
const topics = [
  {
    id:'sin-deficit', number:'4.2.1', title:'Lotes económicos sin déficit', subtitle:'Demanda constante y recepción completa del pedido.', condition:'Faltantes = 0',
    symbols:[...commonSymbols,['PRO','Punto de reorden.'],['Lₑ','Plazo de entrega efectivo.'],['n','Ciclos completos incluidos en L.']],
    cards:[
      {title:'¿Cuánto pedir?', math:row('Q* =',root(fraction('2dK','h'))), plain:'Q* = √(2dK/h)', description:'El lote que minimiza ordenar y almacenar.', featured:true, keywords:'EOQ cantidad óptima lote'},
      {title:'¿Cada cuándo pedir?', math:row('t* =',fraction('Q*','d'),'=',root(fraction('2K','dh'))), plain:'t* = Q*/d = √(2K/(dh))', description:'Tiempo óptimo entre pedidos.', mobileWide:true},
      {title:'¿Cuándo volver a ordenar?', math:row('PRO = dL'), plain:'PRO = dL, si L < t*', description:'Punto de reorden si L es menor que t*.', keywords:'reorden existencias'},
      {title:'Costo total por periodo', math:row('T(Q) =',fraction('dK','Q'),'+ dc +',fraction('hQ','2')), plain:'T(Q) = dK/Q + dc + hQ/2', description:'Ordenar + comprar + almacenar. Sustituye Q* para obtener el costo mínimo.', wide:true},
      {title:'Inventario promedio', math:fraction('Q','2'), plain:'Inventario promedio = Q/2', description:'Promedio de las existencias durante un ciclo.'},
      {title:'Pedidos por año', math:row('N =',fraction('D','Q*')), plain:'N = D/Q*', description:'D = d × periodos de operación al año.'},
      {title:'Si el plazo supera un ciclo', math:row('L_e = L − nt*'), plain:'n = floor(L/t*); Le = L − nt*; PRO = d·Le', description:'n = ⌊L/t*⌋. Redondea hacia abajo y usa PRO = d·Lₑ cuando L ≥ t*.', keywords:'plazo efectivo punto reorden'},
      {title:'Costo de almacenamiento', math:row('h = Ic'), plain:'h = I·c', description:'I y h corresponden al mismo periodo. Por ejemplo, 20% = 0.20.'}
    ],
    extra:`<div class="example"><div><h3>McBurger · Ejemplo de clase</h3><p>d = 300 lb/semana · K = $20/orden · c = $2.09/lb.<br>h = $0.03 × 7 = $0.21/(lb·semana). L = 0.5 semanas.</p></div><div class="example-values"><div><span>Cantidad óptima</span><strong>239.05 <small>lb</small></strong></div><div><span>Punto de reorden</span><strong>150 <small>lb</small></strong></div><div><span>Costo total</span><strong>$677.20</strong><small>por semana</small></div></div></div><p class="note">t* ≈ 0.7968 semanas. Con 52 semanas de operación, N ≈ 65.26 pedidos/año. Si L = 1 semana, PRO ≈ 60.95 lb usando la precisión completa. Las 63 lb del pizarrón resultan de usar t* = 0.79 desde el inicio.</p><p class="note">Si L es múltiplo exacto de t*, Lₑ = 0 y el reorden coincide con el agotamiento, justo antes de recibir el lote. Sobre la posición de inventario (existencias + pedidos en tránsito), el umbral siempre es dL.</p>`
  },
  {
    id:'descuentos', number:'4.2', title:'EOQ con descuentos', subtitle:'El precio de todas las unidades cambia al alcanzar un mínimo de compra.', condition:'Comparar costos totales',
    symbols:[['j','Tramo de precio.'],['cⱼ','Precio por unidad del tramo j.'],['c₀','Precio de lista.'],['aⱼ','Descuento del tramo en decimal.'],['hⱼ','Costo unitario de almacenamiento por periodo.'],['Qⱼ','Cantidad factible a evaluar.'],['Tⱼ','Costo total del tramo por periodo.'],['d, K, I','Misma nomenclatura del modelo sin déficit.']],
    cards:[
      {title:'Lote teórico por tramo', math:row('Q_j* =',root(fraction('2dK','h_j'))), plain:'Q*j = √(2dK/hj)', description:'Calcula un lote para cada nivel de precio.',featured:true},
      {title:'Precio con descuento',math:row('c_j = c_0(1 − a_j)'),plain:'cj = c0(1 − aj)',description:'Si la tabla ya da el precio, úsalo directamente.',mobileWide:true},
      {title:'Almacenar por tramo',math:row('h_j = Ic_j'),plain:'hj = I·cj',description:'Si h es un importe fijo, usa ese mismo valor en todos los tramos.'},
      {title:'Costo que debes comparar',math:row('T_j = dc_j +',fraction('dK','Q_j'),'+',fraction('h_j Q_j','2')),plain:'Tj(Qj) = d·cj + dK/Qj + hj·Qj/2',description:'Incluye la compra porque el precio cambia. El mejor candidato tiene el menor costo total.',wide:true,keywords:'total comparación costo precio'}
    ],
    extra:`<div class="procedure"><div><h3>1. Calcula cada lote</h3><p>Obtén cⱼ, hⱼ y Q*ⱼ en cada tramo de la tabla de precios.</p></div><div><h3>2. Revisa los límites</h3><p>Si Q*ⱼ queda debajo del mínimo, usa el mínimo. Si supera el máximo permitido de piezas enteras, usa ese máximo. Compara los enteros vecinos factibles.</p></div><div><h3>3. Elige el menor costo</h3><p>Evalúa Tⱼ con el precio y la cantidad que sí corresponden a cada tramo.</p></div></div><div class="example"><div><h3>Comparación de precios · Ejemplo ilustrativo</h3><p>d = 1,000 piezas/año · K = $20 · h = $2/(pieza·año). Precio de $10 hasta 199 piezas y de $9.80 desde 200.</p></div><div class="example-table"><table class="comparison-table"><thead><tr><th>Precio</th><th>Lote</th><th>Costo anual</th></tr></thead><tbody><tr><td>$10.00</td><td>141 piezas</td><td>$10,282.84</td></tr><tr class="best"><td>$9.80</td><td>200 piezas</td><td>$10,100.00 ✓</td></tr></tbody></table></div></div><p class="note">El lote teórico es √20,000 ≈ 141.42 piezas. Para el primer tramo, 141 tiene menor costo que 142. Conviene pedir 200 piezas con el descuento.</p>`
  },
  {
    id:'con-deficit',number:'4.2.2',title:'Lotes económicos con déficit',subtitle:'Los clientes esperan y los pedidos pendientes se cubren al recibir el lote.',condition:'Faltantes planeados',
    symbols:[['p','Costo por unidad faltante y por periodo.'],['S','Inventario máximo después de cubrir pendientes.'],['Q − S','Faltante máximo antes de recibir el lote.'],['t₁','Tiempo con existencias.'],['t₂','Tiempo con pedidos pendientes.'],['d, K, c, h','Misma nomenclatura del modelo sin déficit.']],
    cards:[
      {title:'Cantidad óptima con faltantes',math:row('Q* =',root(row(fraction('2dK','h'),'·',fraction('h + p','p')))),plain:'Q* = √[(2dK/h)·(h + p)/p]',description:'El pedido cubre pendientes y deja inventario disponible.',featured:true},
      {title:'Inventario máximo',math:row('S* = Q*',fraction('p','h + p')),plain:'S* = Q*·p/(h + p)',description:'Existencias después de entregar lo pendiente.'},
      {title:'Faltante máximo',math:row('Q* − S* = Q*',fraction('h','h + p')),plain:'Q* − S* = Q*·h/(h + p)',description:'Unidades pendientes antes del reabastecimiento.',small:true,mobileWide:true},
      {title:'Tiempo entre pedidos',math:row('t* =',fraction('Q*','d')),plain:'t* = Q*/d',description:'Un ciclo reúne t₁ + t₂.'},
      {title:'Tiempo con existencias',math:row('t_1 =',fraction('S*','d')),plain:'t1 = S*/d',description:'Desde que se recibe el lote hasta agotar existencias.'},
      {title:'Tiempo con faltantes',math:row('t_2 =',fraction('Q* − S*','d')),plain:'t2 = (Q* − S*)/d',description:'Desde el agotamiento hasta el siguiente lote.'},
      {title:'Fracción del tiempo con existencias',math:row(fraction('t_1','t*'),'=',fraction('S*','Q*'),'=',fraction('p','h + p')),plain:'t1/t* = S*/Q* = p/(h + p)',description:'Multiplica por 100 para obtener el porcentaje.',wide:true},
      {title:'Fracción con faltantes',math:row(fraction('t_2','t*'),'=',fraction('h','h + p')),plain:'t2/t* = h/(h + p)',description:'Las dos fracciones suman 1.'},
      {title:'Costo total por periodo',math:row('T(Q,S) = dc +',fraction('dK','Q'),'+',fraction(row('h',square('S')),'2Q'),'+',fraction(row('p',square('(Q − S)')),'2Q')),plain:'T(Q,S) = dc + dK/Q + hS²/(2Q) + p(Q − S)²/(2Q)',description:'Comprar + ordenar + almacenar + faltantes.',wide:true,small:true},
      {title:'Inventario promedio del ciclo',math:fraction(square('S'),'2Q'),plain:'Inventario promedio = S²/(2Q)',description:'El faltante promedio es (Q − S)²/(2Q).'},
      {title:'Costo mínimo',math:row('T* = dc +',root(fraction('2dKhp','h + p'))),plain:'T* = dc + √[2dKhp/(h + p)]',description:'Corresponde a usar Q* y S*.',wide:true}
    ],
    extra:`<div class="example"><div><h3>Speedy Wheels · Ejemplo del formulario</h3><p>d = 6,000 bicicletas/año · K = $1,000 · c = $400.<br>h = 0.15($400) + $40 = $100/(bicicleta·año).<br>p = $150/(bicicleta·año).</p></div><div class="example-values"><div><span>Lote óptimo</span><strong>447.21</strong><small>bicicletas</small></div><div><span>Inventario máximo</span><strong>268.33</strong><small>bicicletas</small></div><div><span>Faltante máximo</span><strong>178.89</strong><small>bicicletas</small></div></div></div><p class="note">Hay existencias el 60% del ciclo. El costo anual mínimo del modelo continuo es $2,426,832.82. Para pedidos de piezas enteras, compara las alternativas vecinas factibles.</p><p class="note">Aquí p incluye el tiempo de espera. Si un ejercicio cobra una penalización única por pieza faltante, ese cargo se calcula como piezas faltantes × cargo unitario.</p>`
  },
  {
    id:'produccion',number:'4.3',title:'Lote económico de producción',subtitle:'Se fabrica y se vende durante la misma corrida de producción.',condition:'Producción p > demanda r',
    symbols:[['R','Demanda anual en unidades/año.'],['r','Demanda diaria en unidades/día.'],['p','Producción diaria a plena capacidad.'],['Cₚ','Costo por preparar una corrida.'],['Cₕ','Costo de almacenar una unidad por año.'],['Qₒ','Lote óptimo de producción.'],['tₚ','Duración de la corrida en días.'],['c','Costo unitario de fabricación.'],['TIC','Costo anual de inventario.'],['TICₒ','Costo anual mínimo.'],['I','Tasa anual de almacenamiento en decimal.'],['N','Número de corridas por año.']],
    cards:[
      {title:'Lote óptimo de producción',math:row('Q_o =',root(fraction('2RC_p',row('C_h (1 −',fraction('r','p'),')')))),plain:'Qo = √[2R·Cp / (Ch·(1 − r/p))]',description:'Se requiere p > r para acumular existencias.',featured:true},
      {title:'Duración de la corrida',math:row('t_p =',fraction('Q_o','p')),plain:'tp = Qo/p',description:'Días durante los que se fabrica.'},
      {title:'Número de corridas',math:row('N =',fraction('R','Q_o')),plain:'N = R/Qo',description:'Corridas necesarias por año.'},
      {title:'Inventario máximo',math:row('(p − r)t_p = Q_o (1 −',fraction('r','p'),')'),plain:'Inventario máximo = (p − r)·tp = Qo·(1 − r/p)',description:'Durante la corrida se acumulan p − r unidades por día.',wide:true},
      {title:'Inventario promedio',math:fraction(textMath('Inventario máximo'),'2'),plain:'Inventario promedio = Inventario máximo/2',description:'Promedio de las existencias del ciclo.',small:true},
      {title:'Ciclo completo',math:fraction('Q_o','r'),plain:'Ciclo = Qo/r',description:'Tiempo sin producir = Qₒ/r − tₚ.'},
      {title:'Almacenamiento anual',math:row('C_h = Ic'),plain:'Ch = I·c',description:'Usa la tasa anual y el costo unitario de fabricación.'},
      {title:'Tasas diarias',math:row('r =',fraction('R',textMath('días/año'))),plain:'r = R/días de operación al año; p = capacidad anual/días de operación al año',description:'p = capacidad anual ÷ días de operación al año.',small:true},
      {title:'Costo anual con fabricación',math:row('TIC(Q) = Rc +',fraction('RC_p','Q'),'+',fraction('C_h Q','2'),'(1 −',fraction('r','p'),')'),plain:'TIC(Q) = R·c + R·Cp/Q + (Ch·Q/2)·(1 − r/p)',description:'Fabricar + preparar + almacenar. Si piden solo preparación y almacenamiento, suma los dos últimos términos.',wide:true,small:true},
      {title:'Costo anual mínimo',math:row('TIC_o = Rc +',root(row('2RC_p C_h (1 −',fraction('r','p'),')'))),plain:'TICo = R·c + √[2R·Cp·Ch·(1 − r/p)]',description:'Al usar Qₒ, el costo de preparar es igual al de almacenar.',wide:true,small:true}
    ],
    extra:`<p class="note"><strong>Para continuar el tema en clase.</strong> Las fórmulas están completas para el modelo sin faltantes. El ejercicio de producción queda pendiente de los datos que falten. En este tema, p es una tasa de producción diaria.</p>`
  }
];

function renderCard(card) {
  const classes = ['formula-card',card.featured && 'featured',card.wide && 'wide',card.mobileWide && 'mobile-wide'].filter(Boolean).join(' ');
  return `<article class="${classes}" data-search="${escapeHTML([card.title,card.description,card.plain,card.keywords || ''].join(' '))}"><button class="copy" type="button" data-copy="${escapeHTML(card.plain)}" aria-label="Copiar fórmula de ${escapeHTML(card.title)}" title="Copiar fórmula">⧉</button><h3 class="card-label">${card.title}</h3><div class="formula ${card.small ? 'small-math' : ''}">${equation(card.math)}</div><p>${card.description}</p></article>`;
}
document.getElementById('topics').innerHTML = topics.map(topic => `<section class="topic" id="${topic.id}"><div class="topic-header"><span class="section-number">${topic.number}</span><div><h2>${topic.title}</h2><p>${topic.subtitle}</p></div><span class="model-condition">${topic.condition}</span></div><div class="formula-grid">${topic.cards.map(renderCard).join('')}</div><details class="symbol-panel"><summary>Nomenclatura <span>Consulta qué significa cada símbolo</span></summary><dl class="symbol-grid">${topic.symbols.map(([symbol,meaning])=>`<div><dt>${symbol}</dt><dd>${meaning}</dd></div>`).join('')}</dl></details><div class="topic-extra">${topic.extra}</div></section>`).join('');

const demand = document.getElementById('demand');
function drawInventory() {
  const d = Number(demand.value);
  const quantity = Math.sqrt(2 * d * 20 / 0.21);
  const cycle = quantity / d;
  const x = time => 43 + time / 3 * 425;
  const y = inventory => 146 - inventory / 450 * 130;
  let path = `M ${x(0)} ${y(quantity)}`;
  for (let start = 0; start < 3; start += cycle) {
    const end = Math.min(start + cycle, 3);
    const inventory = Math.max(0, quantity - d * (end - start));
    path += ` L ${x(end)} ${y(inventory)}`;
    if (end < 3) path += ` L ${x(end)} ${y(quantity)}`;
  }
  const shade = path + ` L ${x(3)} 146 L 43 146 Z`;
  document.getElementById('cycle-chart').innerHTML = `<title>Inventario con demanda de ${d} libras por semana</title><desc>El pedido óptimo es ${quantity.toFixed(2)} libras cada ${cycle.toFixed(4)} semanas. El inventario desciende hasta cero y se repone al llegar el pedido.</desc><defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#bacb87" stop-opacity=".48"/><stop offset="100%" stop-color="#bacb87" stop-opacity=".03"/></linearGradient></defs>${[0,150,300,450].map(value=>`<line x1="43" y1="${y(value)}" x2="468" y2="${y(value)}" stroke="#d3ddc5" stroke-width=".8" stroke-dasharray="3 4"/><text x="32" y="${y(value)+3}" text-anchor="end" font-size="8" fill="#7b876e" font-family="Arial">${value}</text>`).join('')}<text x="12" y="10" fill="#7b876e" font-size="8" font-family="Arial">lb</text><path d="${shade}" fill="url(#chart-fill)"/><path d="${path}" fill="none" stroke="#526e40" stroke-width="2" stroke-linejoin="round"/><circle cx="43" cy="${y(quantity)}" r="3" fill="#526e40"/><text x="53" y="${y(quantity)-7}" font-size="11" fill="#526e40" font-family="Georgia" font-style="italic">Q*</text>${[0,1,2,3].map(time=>`<text x="${x(time)}" y="162" font-size="9" text-anchor="middle" fill="#7b876e" font-family="Arial">${time}</text>`).join('')}<text x="468" y="177" font-size="8" fill="#7b876e" text-anchor="end" font-family="Arial">semanas</text>`;
  document.getElementById('demand-value').textContent = `${d} lb`;
  document.getElementById('result-q').textContent = `${quantity.toFixed(2)} lb`;
  document.getElementById('result-t').textContent = `${cycle.toFixed(4)} semanas`;
}
demand.addEventListener('input', drawInventory);
drawInventory();

let toastTimer;
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}
document.addEventListener('click', async event => {
  const copyButton = event.target.closest('[data-copy]');
  if (!copyButton) return;
  try {
    await navigator.clipboard.writeText(copyButton.dataset.copy);
    showToast('Fórmula copiada');
  } catch {
    showToast('Selecciona la fórmula para copiarla');
  }
});

const search = document.getElementById('search');
const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function filterFormulas() {
  const query = normalize(search.value.trim());
  let count = 0;
  for (const topic of topics) {
    const section = document.getElementById(topic.id);
    const topicMatch = query && normalize(`${topic.title} ${topic.number}`).includes(query);
    let visible = 0;
    section.querySelectorAll('.formula-card').forEach(card => {
      const match = !query || topicMatch || normalize(card.dataset.search).includes(query);
      card.hidden = !match;
      if (match) visible++;
    });
    section.hidden = visible === 0;
    section.querySelector('.topic-extra').hidden = Boolean(query);
    count += visible;
  }
  const status = document.getElementById('search-status');
  status.hidden = !query;
  status.textContent = `${count} ${count === 1 ? 'fórmula encontrada' : 'fórmulas encontradas'}`;
  document.getElementById('empty').hidden = count > 0;
  document.querySelector('.intro').hidden = Boolean(query);
}
search.addEventListener('input', filterFormulas);
document.getElementById('clear-search').addEventListener('click', () => { search.value = ''; filterFormulas(); search.focus(); });
document.querySelectorAll('.nav-item').forEach(link => link.addEventListener('click', () => {
  search.value = '';
  filterFormulas();
  document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active',item === link));
}));
const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      document.querySelectorAll('.nav-item').forEach(link => {
        const active = link.dataset.target === entry.target.id;
        link.classList.toggle('active',active);
        if (active) link.setAttribute('aria-current','location');
        else link.removeAttribute('aria-current');
      });
    }
  }
},{rootMargin:'-15% 0px -68% 0px',threshold:0});
document.querySelectorAll('#inicio,.topic').forEach(section => observer.observe(section));

let detailsBeforePrint = [];
window.addEventListener('beforeprint', () => {
  detailsBeforePrint = [...document.querySelectorAll('details')].map(detail => detail.open);
  document.querySelectorAll('details').forEach(detail => detail.open = true);
});
window.addEventListener('afterprint', () => {
  document.querySelectorAll('details').forEach((detail,index) => detail.open = detailsBeforePrint[index]);
});
document.getElementById('print').addEventListener('click', () => {
  search.value = '';
  filterFormulas();
  window.print();
});
