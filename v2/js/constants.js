"use strict";

window.MoncofaApp = window.MoncofaApp || {};

MoncofaApp.Constants = {
    FORMATIONS: {
        '3-3-1': [
            { id: 0, x: 50, y: 90, role: 'GK' },
            { id: 1, x: 20, y: 75, role: 'DEF' }, { id: 2, x: 50, y: 75, role: 'DEF' }, { id: 3, x: 80, y: 75, role: 'DEF' },
            { id: 4, x: 20, y: 50, role: 'MED' }, { id: 5, x: 50, y: 50, role: 'MED' }, { id: 6, x: 80, y: 50, role: 'MED' },
            { id: 7, x: 50, y: 25, role: 'DEL' }
        ],
        '4-2-1': [
            { id: 0, x: 50, y: 90, role: 'GK' },
            { id: 1, x: 15, y: 75, role: 'DEF' }, { id: 2, x: 38, y: 75, role: 'DEF' }, { id: 3, x: 62, y: 75, role: 'DEF' }, { id: 6, x: 85, y: 75, role: 'DEF' },
            { id: 4, x: 35, y: 45, role: 'MED' }, { id: 5, x: 65, y: 45, role: 'MED' }, // 2 medios
            { id: 7, x: 50, y: 20, role: 'DEL' } // 1 punta
        ],
        '2-3-2': [
            { id: 0, x: 50, y: 90, role: 'GK' },
            { id: 1, x: 30, y: 75, role: 'DEF' }, { id: 3, x: 70, y: 75, role: 'DEF' },
            { id: 2, x: 50, y: 50, role: 'MED' }, { id: 4, x: 20, y: 50, role: 'MED' }, { id: 5, x: 80, y: 50, role: 'MED' },
            { id: 6, x: 35, y: 25, role: 'DEL' }, { id: 7, x: 65, y: 25, role: 'DEL' }
        ],
        '3-2-2': [
            { id: 0, x: 50, y: 90, role: 'GK' },
            { id: 1, x: 20, y: 75, role: 'DEF' }, { id: 2, x: 50, y: 75, role: 'DEF' }, { id: 3, x: 80, y: 75, role: 'DEF' },
            { id: 4, x: 35, y: 50, role: 'MED' }, { id: 5, x: 65, y: 50, role: 'MED' },
            { id: 6, x: 35, y: 25, role: 'DEL' }, { id: 7, x: 65, y: 25, role: 'DEL' }
        ],
        '2-4-1': [
            { id: 0, x: 50, y: 90, role: 'GK' },
            { id: 1, x: 30, y: 75, role: 'DEF' }, { id: 2, x: 70, y: 75, role: 'DEF' },
            { id: 3, x: 15, y: 50, role: 'MED' }, { id: 4, x: 38, y: 50, role: 'MED' }, { id: 5, x: 62, y: 50, role: 'MED' }, { id: 6, x: 85, y: 50, role: 'MED' },
            { id: 7, x: 50, y: 25, role: 'DEL' }
        ],
        '3-4-0': [
            { id: 0, x: 50, y: 90, role: 'GK' },
            { id: 1, x: 20, y: 75, role: 'DEF' }, { id: 2, x: 50, y: 75, role: 'DEF' }, { id: 3, x: 80, y: 75, role: 'DEF' },
            { id: 4, x: 15, y: 40, role: 'MED' }, { id: 5, x: 38, y: 40, role: 'MED' }, { id: 6, x: 62, y: 40, role: 'MED' }, { id: 7, x: 85, y: 40, role: 'MED' }
        ],
        '4-3-0': [
            { id: 0, x: 50, y: 90, role: 'GK' },
            { id: 1, x: 15, y: 75, role: 'DEF' }, { id: 2, x: 38, y: 75, role: 'DEF' }, { id: 3, x: 62, y: 75, role: 'DEF' }, { id: 6, x: 85, y: 75, role: 'DEF' },
            { id: 4, x: 20, y: 45, role: 'MED' }, { id: 5, x: 50, y: 45, role: 'MED' }, { id: 7, x: 80, y: 45, role: 'MED' }
        ]
    },
    INITIAL_SQUAD: [
        { id: 1, number: "1", name: "Jorge", role: "GK", calledUp: true },
        { id: 2, number: "2", name: "Gabriel", role: "FIELD", calledUp: true },
        { id: 3, number: "3", name: "Héctor", role: "FIELD", calledUp: true },
        { id: 4, number: "4", name: "Nicolás", role: "FIELD", calledUp: true },
        { id: 5, number: "5", name: "Hugo", role: "FIELD", calledUp: true },
        { id: 6, number: "6", name: "Leon", role: "FIELD", calledUp: true },
        { id: 7, number: "7", name: "Rubén", role: "FIELD", calledUp: true },
        { id: 8, number: "8", name: "Marc", role: "FIELD", calledUp: true },
        { id: 9, number: "9", name: "Angel", role: "FIELD", calledUp: true },
        { id: 10, number: "10", name: "Martín", role: "FIELD", calledUp: true },
        { id: 11, number: "12", name: "Álex", role: "FIELD", calledUp: true },
        { id: 12, number: "15", name: "Moises", role: "FIELD", calledUp: true },
        { id: 13, number: "16", name: "Imram", role: "FIELD", calledUp: true },
        { id: 14, number: "20", name: "Collado", role: "FIELD", calledUp: true },
        { id: 15, number: "22", name: "Carlos", role: "FIELD", calledUp: true },
        { id: 16, number: "98", name: "Valentino", role: "GK", calledUp: true },
    ].sort((a, b) => parseInt(a.number) - parseInt(b.number)),
    DEFAULT_COLORS: {
        '--team-shirt': '#dc2626',
        '--team-shorts': '#000000',
        '--team-socks': '#000000',
        '--team-number': '#ffffff',
        '--gk-shirt': '#bef264',
        '--gk-shorts': '#15803d',
        '--gk-socks': '#bef264',
        '--gk-number': '#000000'
    },
    DEFAULT_LOGO: "img/logo.png"
};
