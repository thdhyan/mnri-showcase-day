/* Photo coordinates use percentages of the supplied, fixed satellite image.
   Approximate locations inferred from the owner's sketch; indoor stops are offset
   within their building so each remains selectable. Keep in sync if replacing the map. */
(function () {
  'use strict';
  const local = (name) => 'media/campus/' + name + '.jpeg';
  const old = (name) => 'media/walking/' + name + '.png';
  const stop = (title, photo, x, y, text) => ({ title, photo, x, y, text });
  const routes = {
    station: [
      stop('East Bank station', local('station-platform'), 70, 95, 'Start at East Bank station on the Green Line. Use the marked crossing toward Keller Hall.'),
      stop('Keller Hall from Washington Avenue', local('keller-from-station'), 47, 91, 'Look for the brick Keller Hall building shown here.'),
      stop('Keller south entrance', local('keller-south-entrance'), 38, 79, 'Approach the recessed entrance with red doors.'),
      stop('Red-door atrium', local('keller-red-door-atrium'), 34, 73, 'At the outdoor atrium, enter the red doors for Keller Hall, or stay outside and follow the courtyard toward Mechanical Engineering (photo 10).'),
      stop('Keller lobby', local('keller-lobby'), 31, 67, 'Inside Keller Hall, look for the lobby shown here. Follow event signs for your room.'),
      stop('Keller interior corridor', local('keller-corridor'), 25, 63, 'Use the glass-sided corridor as an indoor landmark.'),
      stop('Keller landing', local('keller-landing'), 32, 58, 'Match this landing with your surroundings; check posted room signs.'),
      stop('Keller hallway', local('keller-hallway'), 39, 63, 'Continue using the room signs and event signage.'),
      stop('Keller exit', local('keller-exit'), 43, 56, 'This exit is a landmark for continuing to the other event buildings.')
    ],
    mechanical: [
      stop('Keller courtyard', local('keller-courtyard'), 24, 57, 'Leave Keller toward the courtyard and Scholars Walk. Match the buildings with this view.'),
      stop('Mechanical Engineering approach', local('mechanical-approach'), 18, 46, 'Follow Scholars Walk toward Mechanical Engineering, north of Keller Hall.'),
      stop('Mechanical Engineering entrance', old('step01-entrance-me'), 17, 40, 'Find the Mechanical Engineering entrance shown in this photo.'),
      stop('Inside Mechanical Engineering', old('step02-right-after-entering'), 21, 36, 'After entering, take a right toward the corridor.'),
      stop('ME 1130 corridor', old('step03-hallway-me1130'), 26, 36, 'Follow the hallway to ME 1130; check the room signs.')
    ],
    shepherd: [
      stop('Keller exit', local('keller-exit'), 43, 56, 'Leave Keller and head toward Union Street and Scholars Walk.'),
      stop('Union Street', local('union-street'), 51, 47, 'Use the street and parking ramp as landmarks. Head north toward Shepherd Laboratories.'),
      stop('Walk toward Shepherd', local('shepherd-approach'), 49, 28, 'Continue along the walkway between the buildings toward Shepherd.'),
      stop('Shepherd Laboratories entrance', old('step09-entrance-shepherd'), 46, 13, 'Look for the Shepherd Laboratories entrance shown here.'),
      stop('Enter Shepherd Laboratories', old('step10-right-then-left'), 40, 12, 'At the entrance, take a right, then an immediate left as shown.'),
      stop('Drone Lab / Shep 164', old('step11-drone-lab-entrance'), 34, 12, 'Find the Drone Lab at Shep 164. Follow event signs for other Shepherd rooms.')
    ],
    mechanicalShepherd: [
      stop('Exit Mechanical Engineering', old('step04-exit-building'), 31, 36, 'From ME 1130, walk back to the exit door shown here.'),
      stop('Turn right toward Shepherd', old('step05-right-sheplabs'), 17, 40, 'Outside Mechanical Engineering, take a right toward Shepherd Laboratories.'),
      stop('Follow the covered walkway', old('step06-walk-end'), 36, 43, 'Continue along the covered walkway to the end of the building.'),
      stop('Turn left at the end', old('step07-left-turn'), 49, 28, 'At the end of the walkway, take a left as shown by the arrow.'),
      stop('Continue toward Shepherd', old('step08-walk-end2'), 47, 40, 'Keep walking to the end of the building toward the Shepherd entrance.'),
    ]
  };
  const el = (id) => document.getElementById('campus-' + id);
  routes.mechanicalShepherd.push(...routes.shepherd.slice(3));
  // Reuse shared photo stops so entrances appear only once on the combined map.
  const route = [...new Map(Object.values(routes).flat().map((item) => [item.photo, item])).values()];
  const groupFor = (item) => route.map((point, index) => ({ point, index }))
    .filter(({ point }) => point.x === item.x && point.y === item.y);
  // SVG annotations stay aligned with the original 1600 × 1200 photos.
  const annotations = {
    'step01-entrance-me': { viewBox: '0 0 981 552', fontSize: 20, box: [282, 217, 170, 245], arrow: 'M 510 420 L 840 420', label: [475, 505, 'After exiting: turn right toward Shepherd'] },
    'station-platform': { box: [490, 350, 320, 370], arrow: 'M 270 1000 L 350 655', label: [100, 1110, 'Follow platform to the marked crossing'] },
    'keller-from-station': { box: [410, 210, 1010, 650], arrow: 'M 480 1040 L 850 790', label: [260, 1130, 'Keller Hall • use the marked crossing'] },
    'keller-south-entrance': { box: [930, 525, 180, 310], arrow: 'M 600 1040 L 1000 760', label: [280, 1130, 'Approach the red-door entrance'] },
    'keller-red-door-atrium': { box: [1070, 630, 520, 290], arrow: 'M 780 1050 L 1250 830', label: [450, 1140, 'Enter through the red doors on the right'] },
    'keller-lobby': { box: [450, 285, 260, 360], arrow: 'M 850 950 L 590 590', label: [400, 1100, 'Continue toward the glass-sided corridor'] },
    'keller-corridor': { box: [760, 540, 180, 220], arrow: 'M 620 1070 L 850 740', label: [420, 1140, 'Follow this corridor straight ahead'] },
    'keller-landing': { box: [0, 530, 620, 190], arrow: 'M 900 1000 L 440 710', label: [390, 1120, 'Continue across the landing'] },
    'keller-hallway': { box: [675, 570, 130, 150], arrow: 'M 780 1060 L 740 740', label: [400, 1140, 'Follow the hallway • check room signs'] },
    'keller-exit': { box: [900, 505, 180, 265], arrow: 'M 650 870 L 970 660', label: [340, 880, 'Exit Keller through these doors'] },
    'union-street': { box: [960, 590, 55, 145], arrow: 'M 740 1050 L 340 1050', label: [180, 1120, 'Turn left along this sidewalk'], landmark: [1030, 570, 'Parking ramp landmark'] },
    'shepherd-approach': { box: [720, 625, 170, 150], arrow: 'M 670 1060 L 815 770', label: [330, 1120, 'Continue straight toward Shepherd'] }
  };
  const svgNS = 'http://www.w3.org/2000/svg';
  function annotate(photo) {
    const overlay = el('annotations');
    overlay.replaceChildren();
    const key = photo.split('/').pop().replace(/\.(jpeg|png)$/, '');
    const note = annotations[key];
    overlay.hidden = !note;
    if (!note) return;
    overlay.ownerSVGElement.setAttribute('viewBox', note.viewBox || '0 0 1600 1200');
    const add = (tag, attrs, text) => {
      const node = document.createElementNS(svgNS, tag);
      Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
      if (text) node.textContent = text;
      overlay.append(node);
      return node;
    };
    const [x, y, width, height] = note.box;
    add('rect', { x, y, width, height, fill: 'none', stroke: '#ff2020', 'stroke-width': 10 });
    add('path', { d: note.arrow, fill: 'none', stroke: 'white', 'stroke-width': 30, 'stroke-linecap': 'round', 'marker-end': 'url(#photo-arrow-white)' });
    add('path', { d: note.arrow, fill: 'none', stroke: '#ff2020', 'stroke-width': 18, 'stroke-linecap': 'round', 'marker-end': 'url(#photo-arrow-red)' });
    [note.label, note.landmark].filter(Boolean).forEach(([x, y, text]) => {
      add('text', { x, y, fill: '#e00000', stroke: 'white', 'stroke-width': 14, 'paint-order': 'stroke', 'font-family': 'Arial, sans-serif', 'font-size': note.fontSize || 48, 'font-weight': 700 }, text);
    });
  }
  let selected = 0;
  function show(index) {
    selected = index;
    const item = route[index];
    // One entrance photo carries both arrival and departure instructions.
    const entrance = route.find((point) => point.photo === old('step01-entrance-me'));
    const combinedEntrance = item.photo === entrance.photo || item.photo === old('step05-right-sheplabs');
    const display = combinedEntrance ? entrance : item;
    el('photo').src = display.photo;
    annotate(display.photo);
    el('photo').alt = display.title;
    el('full-photo').href = display.photo;
    el('stop-title').textContent = combinedEntrance ? 'Mechanical Engineering entrance / exit toward Shepherd' : item.title;
    const group = groupFor(item);
    el('count').textContent = 'Photo stop ' + group.map(({ index }) => index + 1).join(' / ') + ' of ' + route.length;
    el('related-photos').replaceChildren();
    group.filter((other) => other.index !== index && !combinedEntrance).forEach(({ point, index: otherIndex }) => {
      const figure = document.createElement('figure');
      const caption = document.createElement('figcaption');
      caption.textContent = 'Same location · Photo ' + (otherIndex + 1) + ': ' + point.title;
      const link = document.createElement('a');
      link.href = point.photo;
      link.target = '_blank';
      link.rel = 'noopener';
      const photo = document.createElement('img');
      photo.src = point.photo;
      photo.alt = point.title;
      link.append(photo);
      const instruction = document.createElement('p');
      instruction.textContent = point.text;
      figure.append(caption, link, instruction);
      el('related-photos').append(figure);
    });
    el('instruction').textContent = combinedEntrance ? 'Enter Mechanical Engineering here for ME 1130. After returning outside, turn right toward Shepherd Laboratories.' : item.text;
    el('prev').disabled = index === 0;
    el('next').disabled = index === route.length - 1;
    el('pins').querySelectorAll('button').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.stops.split(',').includes(String(index))));
    });
    el('stop-list').querySelectorAll('button').forEach((button, i) => {
      button.setAttribute('aria-pressed', String(i === index));
    });
  }
  function draw() {
    el('pins').replaceChildren();
    el('stop-list').replaceChildren();
    const colors = ['#ffcc33', '#64e4ff', '#e6a3ff', '#9bff91'];
    // Stable photo numbers match the map, list and navigation-tree diagram.
    // Nested arrays represent separate branches within the same walking route.
    const paths = [
      [[1, 2, 3, 4, 5, 6, 7, 8, 9]],
      [[3, 4, 10, 12, 13, 14, 20], [9, 10]],
      [[9, 15, 11, 16, 17, 18, 19]],
      [[12, 22, 24, 23, 17, 18, 19]]
    ];
    paths.forEach((branches, index) => {
      const line = document.createElementNS(svgNS, 'path');
      line.setAttribute('d', branches.map((branch) => branch.map((id, i) => {
        const point = route[id - 1];
        return (i === 0 ? 'M ' : 'L ') + point.x + ',' + point.y;
      }).join(' ')).join(' '));
      line.setAttribute('stroke', colors[index]);
      el('lines').append(line);
    });
    route.forEach((item, index) => {
      const group = groupFor(item);
      if (group[0].index === index) {
        const pin = document.createElement('button');
        pin.dataset.stops = group.map(({ index }) => index).join(',');
        pin.type = 'button';
        pin.className = 'campus-pin';
        pin.style.left = item.x + '%';
        pin.style.top = item.y + '%';
        const cross = document.createElement('span');
        cross.textContent = '×';
        cross.setAttribute('aria-hidden', 'true');
        const number = document.createElement('small');
        number.textContent = group.map(({ index }) => index + 1).join('/');
        pin.append(cross, number);
        pin.title = group.map(({ point }) => point.title).join(' / ');
        pin.setAttribute('aria-label', 'Photo ' + number.textContent + ': ' + pin.title);
        pin.addEventListener('click', () => show(index));
        el('pins').append(pin);
      }
      const row = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = item.title;
      button.addEventListener('click', () => show(index));
      row.append(button);
      el('stop-list').append(row);
    });
    show(0);
  }
  el('prev').addEventListener('click', () => show(Math.max(0, selected - 1)));
  el('next').addEventListener('click', () => show(Math.min(route.length - 1, selected + 1)));
  draw();
}());
