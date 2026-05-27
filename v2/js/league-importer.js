"use strict";

window.MoncofaApp = window.MoncofaApp || {};

MoncofaApp.LeagueImporter = {
    // The raw data extracted from FFCV
    ffcvData: [
        {"jornada": 1, "date": "Sábado 18 de Octubre de 2025", "home": "Xilxes C.F.", "away": "C.D. Altura", "scoreHome": "2", "scoreAway": "2"},
        {"jornada": 1, "date": "Sábado 18 de Octubre de 2025", "home": "Club Almenara Atlètic 'B'", "away": "C.D. Soneja 'A'", "scoreHome": "4", "scoreAway": "4"},
        {"jornada": 1, "date": "Sábado 18 de Octubre de 2025", "home": "Artana C.F.", "away": "La Vilavella C.F. 'A'", "scoreHome": "0", "scoreAway": "3"},
        {"jornada": 1, "date": "Sábado 18 de Octubre de 2025", "home": "Andiamo Vila-Real C.F. 'C'", "away": "C.D. Burriana F.B. 'B'", "scoreHome": "1", "scoreAway": "2"},
        {"jornada": 1, "date": "Sábado 18 de Octubre de 2025", "home": "C.F. Nules 'C'", "away": "C.F. Sorinthule Football Pro Burriana 'B'", "scoreHome": "3", "scoreAway": "2"},
        {"jornada": 1, "date": "Domingo 19 de Octubre de 2025", "home": "C.D. Jérica", "away": "U.D. Vall de Uxó 'B'", "scoreHome": "6", "scoreAway": "5"},
        {"jornada": 1, "date": "Domingo 19 de Octubre de 2025", "home": "S.D. Asoc. Cult y Dptva. E. Mpal Futbol Llucena", "away": "C.F Platges de Moncofa 'B'", "scoreHome": "3", "scoreAway": "6"},
        {"jornada": 2, "date": "Viernes 24 de Octubre de 2025", "home": "C.F Platges de Moncofa 'B'", "away": "Andiamo Vila-Real C.F. 'C'", "scoreHome": "6", "scoreAway": "2"},
        {"jornada": 2, "date": "Sábado 25 de Octubre de 2025", "home": "C.F. Sorinthule Football Pro Burriana 'B'", "away": "Club Almenara Atlètic 'B'", "scoreHome": "4", "scoreAway": "2"},
        {"jornada": 2, "date": "Sábado 25 de Octubre de 2025", "home": "U.D. Vall de Uxó 'B'", "away": "Artana C.F.", "scoreHome": "6", "scoreAway": "6"},
        {"jornada": 2, "date": "Sábado 25 de Octubre de 2025", "home": "C.D. Altura", "away": "C.D. Jérica", "scoreHome": "3", "scoreAway": "7"},
        {"jornada": 2, "date": "Sábado 25 de Octubre de 2025", "home": "C.D. Burriana F.B. 'B'", "away": "Xilxes C.F.", "scoreHome": "2", "scoreAway": "3"},
        {"jornada": 2, "date": "Sábado 25 de Octubre de 2025", "home": "C.D. Soneja 'A'", "away": "S.D. Asoc. Cult y Dptva. E. Mpal Futbol Llucena", "scoreHome": "7", "scoreAway": "4"},
        {"jornada": 2, "date": "Sábado 25 de Octubre de 2025", "home": "La Vilavella C.F. 'A'", "away": "C.F. Nules 'C'", "scoreHome": "4", "scoreAway": "1"},
        {"jornada": 3, "date": "Viernes 31 de Octubre de 2025", "home": "C.F. Sorinthule Football Pro Burriana 'B'", "away": "S.D. Asoc. Cult y Dptva. E. Mpal Futbol Llucena", "scoreHome": "2", "scoreAway": "4"},
        {"jornada": 3, "date": "Sábado 1 de Noviembre de 2025", "home": "C.D. Burriana F.B. 'B'", "away": "C.F Platges de Moncofa 'B'", "scoreHome": "2", "scoreAway": "5"},
        {"jornada": 3, "date": "Sábado 1 de Noviembre de 2025", "home": "Andiamo Vila-Real C.F. 'C'", "away": "C.D. Soneja 'A'", "scoreHome": "3", "scoreAway": "4"},
        {"jornada": 3, "date": "Sábado 1 de Noviembre de 2025", "home": "Club Almenara Atlètic 'B'", "away": "La Vilavella C.F. 'A'", "scoreHome": "2", "scoreAway": "4"},
        {"jornada": 3, "date": "Sábado 1 de Noviembre de 2025", "home": "C.F. Nules 'C'", "away": "U.D. Vall de Uxó 'B'", "scoreHome": "6", "scoreAway": "1"},
        {"jornada": 3, "date": "Sábado 1 de Noviembre de 2025", "home": "Artana C.F.", "away": "C.D. Altura", "scoreHome": "5", "scoreAway": "6"},
        {"jornada": 3, "date": "Domingo 2 de Noviembre de 2025", "home": "Xilxes C.F.", "away": "C.D. Jérica", "scoreHome": "3", "scoreAway": "7"},
        {"jornada": 4, "date": "Sábado 8 de Noviembre de 2025", "home": "La Vilavella C.F. 'A'", "away": "S.D. Asoc. Cult y Dptva. E. Mpal Futbol Llucena", "scoreHome": "6", "scoreAway": "1"},
        {"jornada": 4, "date": "Sábado 8 de Noviembre de 2025", "home": "C.F. Sorinthule Football Pro Burriana 'B'", "away": "Andiamo Vila-Real C.F. 'C'", "scoreHome": "7", "scoreAway": "0"},
        {"jornada": 4, "date": "Sábado 8 de Noviembre de 2025", "home": "C.F Platges de Moncofa 'B'", "away": "Xilxes C.F.", "scoreHome": "5", "scoreAway": "1"},
        {"jornada": 4, "date": "Sábado 8 de Noviembre de 2025", "home": "C.D. Altura", "away": "C.F. Nules 'C'", "scoreHome": "2", "scoreAway": "2"},
        {"jornada": 4, "date": "Sábado 8 de Noviembre de 2025", "home": "U.D. Vall de Uxó 'B'", "away": "Club Almenara Atlètic 'B'", "scoreHome": "3", "scoreAway": "0"},
        {"jornada": 4, "date": "Sábado 8 de Noviembre de 2025", "home": "C.D. Soneja 'A'", "away": "C.D. Burriana F.B. 'B'", "scoreHome": "5", "scoreAway": "3"},
        {"jornada": 4, "date": "Domingo 9 de Noviembre de 2025", "home": "C.D. Jérica", "away": "Artana C.F.", "scoreHome": "6", "scoreAway": "1"},
        {"jornada": 5, "date": "Viernes 14 de Noviembre de 2025", "home": "Club Almenara Atlètic 'B'", "away": "C.D. Altura", "scoreHome": "2", "scoreAway": "4"},
        {"jornada": 5, "date": "Sábado 15 de Noviembre de 2025", "home": "C.D. Burriana F.B. 'B'", "away": "C.F. Sorinthule Football Pro Burriana 'B'", "scoreHome": "0", "scoreAway": "3"},
        {"jornada": 5, "date": "Sábado 15 de Noviembre de 2025", "home": "C.F. Nules 'C'", "away": "C.D. Jérica", "scoreHome": "5", "scoreAway": "0"},
        {"jornada": 5, "date": "Sábado 15 de Noviembre de 2025", "home": "Andiamo Vila-Real C.F. 'C'", "away": "La Vilavella C.F. 'A'", "scoreHome": "0", "scoreAway": "9"},
        {"jornada": 5, "date": "Sábado 15 de Noviembre de 2025", "home": "C.F Platges de Moncofa 'B'", "away": "C.D. Soneja 'A'", "scoreHome": "10", "scoreAway": "1"},
        {"jornada": 5, "date": "Domingo 16 de Noviembre de 2025", "home": "S.D. Asoc. Cult y Dptva. E. Mpal Futbol Llucena", "away": "U.D. Vall de Uxó 'B'", "scoreHome": "3", "scoreAway": "9"},
        {"jornada": 5, "date": "Domingo 16 de Noviembre de 2025", "home": "Xilxes C.F.", "away": "Artana C.F.", "scoreHome": "4", "scoreAway": "1"},
        {"jornada": 6, "date": "Sábado 22 de Noviembre de 2025", "home": "La Vilavella C.F. 'A'", "away": "C.D. Burriana F.B. 'B'", "scoreHome": "5", "scoreAway": "3"},
        {"jornada": 6, "date": "Sábado 22 de Noviembre de 2025", "home": "C.D. Altura", "away": "S.D. Asoc. Cult y Dptva. E. Mpal Futbol Llucena", "scoreHome": "5", "scoreAway": "1"},
        {"jornada": 6, "date": "Sábado 22 de Noviembre de 2025", "home": "C.D. Soneja 'A'", "away": "Xilxes C.F.", "scoreHome": "1", "scoreAway": "4"},
        {"jornada": 6, "date": "Sábado 22 de Noviembre de 2025", "home": "U.D. Vall de Uxó 'B'", "away": "Andiamo Vila-Real C.F. 'C'", "scoreHome": "6", "scoreAway": "0"},
        {"jornada": 6, "date": "Sábado 22 de Noviembre de 2025", "home": "C.F. Sorinthule Football Pro Burriana 'B'", "away": "C.F Platges de Moncofa 'B'", "scoreHome": "1", "scoreAway": "4"},
        {"jornada": 6, "date": "Sábado 22 de Noviembre de 2025", "home": "Artana C.F.", "away": "C.F. Nules 'C'", "scoreHome": "1", "scoreAway": "5"},
        {"jornada": 6, "date": "Domingo 23 de Noviembre de 2025", "home": "C.D. Jérica", "away": "Club Almenara Atlètic 'B'", "scoreHome": "3", "scoreAway": "1"},
        {"jornada": 7, "date": "Sábado 29 de Noviembre de 2025", "home": "Xilxes C.F.", "away": "C.F. Nules 'C'", "scoreHome": "4", "scoreAway": "4"},
        {"jornada": 7, "date": "Sábado 29 de Noviembre de 2025", "home": "C.D. Burriana F.B. 'B'", "away": "U.D. Vall de Uxó 'B'", "scoreHome": "2", "scoreAway": "3"},
        {"jornada": 7, "date": "Sábado 29 de Noviembre de 2025", "home": "C.D. Soneja 'A'", "away": "C.F. Sorinthule Football Pro Burriana 'B'", "scoreHome": "3", "scoreAway": "1"},
        {"jornada": 7, "date": "Sábado 29 de Noviembre de 2025", "home": "C.F Platges de Moncofa 'B'", "away": "La Vilavella C.F. 'A'", "scoreHome": "0", "scoreAway": "1"},
        {"jornada": 7, "date": "Sábado 29 de Noviembre de 2025", "home": "Andiamo Vila-Real C.F. 'C'", "away": "C.D. Altura", "scoreHome": "0", "scoreAway": "8"},
        {"jornada": 7, "date": "Sábado 29 de Noviembre de 2025", "home": "Club Almenara Atlètic 'B'", "away": "Artana C.F.", "scoreHome": "0", "scoreAway": "4"},
        {"jornada": 7, "date": "Domingo 30 de Noviembre de 2025", "home": "S.D. Asoc. Cult y Dptva. E. Mpal Futbol Llucena", "away": "C.D. Jérica", "scoreHome": "0", "scoreAway": "2"},
        {"jornada": 8, "date": "Sábado 13 de Diciembre de 2025", "home": "La Vilavella C.F. 'A'", "away": "C.D. Soneja 'A'", "scoreHome": "7", "scoreAway": "0"},
        {"jornada": 8, "date": "Sábado 13 de Diciembre de 2025", "home": "C.F. Nules 'C'", "away": "Club Almenara Atlètic 'B'", "scoreHome": "2", "scoreAway": "2"},
        {"jornada": 8, "date": "Sábado 13 de Diciembre de 2025", "home": "C.D. Altura", "away": "C.D. Burriana F.B. 'B'", "scoreHome": "6", "scoreAway": "2"},
        {"jornada": 8, "date": "Sábado 13 de Diciembre de 2025", "home": "U.D. Vall de Uxó 'B'", "away": "C.F Platges de Moncofa 'B'", "scoreHome": "1", "scoreAway": "8"},
        {"jornada": 8, "date": "Sábado 13 de Diciembre de 2025", "home": "C.F. Sorinthule Football Pro Burriana 'B'", "away": "Xilxes C.F.", "scoreHome": "5", "scoreAway": "0"},
        {"jornada": 8, "date": "Domingo 14 de Diciembre de 2025", "home": "C.D. Jérica", "away": "Andiamo Vila-Real C.F. 'C'", "scoreHome": "6", "scoreAway": "2"},
        {"jornada": 8, "date": "Domingo 14 de Diciembre de 2025", "home": "Artana C.F.", "away": "S.D. Asoc. Cult y Dptva. E. Mpal Futbol Llucena", "scoreHome": "2", "scoreAway": "2"},
        {"jornada": 9, "date": "Viernes 19 de Diciembre de 2025", "home": "S.D. Asoc. Cult y Dptva. E. Mpal Futbol Llucena", "away": "C.F. Nules 'C'", "scoreHome": "1", "scoreAway": "7"},
        {"jornada": 9, "date": "Sábado 20 de Diciembre de 2025", "home": "C.F. Sorinthule Football Pro Burriana 'B'", "away": "La Vilavella C.F. 'A'", "scoreHome": "1", "scoreAway": "6"},
        {"jornada": 9, "date": "Sábado 20 de Diciembre de 2025", "home": "C.D. Soneja 'A'", "away": "U.D. Vall de Uxó 'B'", "scoreHome": "1", "scoreAway": "3"},
        {"jornada": 9, "date": "Sábado 20 de Diciembre de 2025", "home": "C.F Platges de Moncofa 'B'", "away": "C.D. Altura", "scoreHome": "4", "scoreAway": "0"},
        {"jornada": 9, "date": "Sábado 20 de Diciembre de 2025", "home": "Xilxes C.F.", "away": "Club Almenara Atlètic 'B'", "scoreHome": "3", "scoreAway": "3"},
        {"jornada": 9, "date": "Sábado 20 de Diciembre de 2025", "home": "Andiamo Vila-Real C.F. 'C'", "away": "Artana C.F.", "scoreHome": "4", "scoreAway": "3"},
        {"jornada": 9, "date": "Domingo 21 de Diciembre de 2025", "home": "C.D. Burriana F.B. 'B'", "away": "C.D. Jérica", "scoreHome": "1", "scoreAway": "5"},
        {"jornada": 10, "date": "Sábado 10 de Enero de 2026", "home": "C.F. Nules 'C'", "away": "Andiamo Vila-Real C.F. 'C'", "scoreHome": "5", "scoreAway": "0"},
        {"jornada": 10, "date": "Sábado 10 de Enero de 2026", "home": "La Vilavella C.F. 'A'", "away": "Xilxes C.F.", "scoreHome": "7", "scoreAway": "1"},
        {"jornada": 10, "date": "Sábado 10 de Enero de 2026", "home": "Artana C.F.", "away": "C.D. Burriana F.B. 'B'", "scoreHome": "5", "scoreAway": "1"},
        {"jornada": 10, "date": "Sábado 10 de Enero de 2026", "home": "U.D. Vall de Uxó 'B'", "away": "C.F. Sorinthule Football Pro Burriana 'B'", "scoreHome": "4", "scoreAway": "1"},
        {"jornada": 10, "date": "Domingo 11 de Enero de 2026", "home": "C.D. Jérica", "away": "C.F Platges de Moncofa 'B'", "scoreHome": "2", "scoreAway": "2"},
        {"jornada": 10, "date": "Domingo 11 de Enero de 2026", "home": "Club Almenara Atlètic 'B'", "away": "S.D. Asoc. Cult y Dptva. E. Mpal Futbol Llucena", "scoreHome": "4", "scoreAway": "2"},
        {"jornada": 10, "date": "Domingo 11 de Enero de 2026", "home": "C.D. Altura", "away": "C.D. Soneja 'A'", "scoreHome": "6", "scoreAway": "1"},
        {"jornada": 11, "date": "Sábado 17 de Enero de 2026", "home": "La Vilavella C.F. 'A'", "away": "U.D. Vall de Uxó 'B'", "scoreHome": "8", "scoreAway": "2"},
        {"jornada": 11, "date": "Sábado 17 de Enero de 2026", "home": "C.D. Soneja 'A'", "away": "C.D. Jérica", "scoreHome": "1", "scoreAway": "1"},
        {"jornada": 11, "date": "Sábado 17 de Enero de 2026", "home": "Xilxes C.F.", "away": "S.D. Asoc. Cult y Dptva. E. Mpal Futbol Llucena", "scoreHome": "2", "scoreAway": "1"},
        {"jornada": 11, "date": "Sábado 17 de Enero de 2026", "home": "C.F. Sorinthule Football Pro Burriana 'B'", "away": "C.D. Altura", "scoreHome": "1", "scoreAway": "2"},
        {"jornada": 11, "date": "Sábado 17 de Enero de 2026", "home": "Andiamo Vila-Real C.F. 'C'", "away": "Club Almenara Atlètic 'B'", "scoreHome": "1", "scoreAway": "6"},
        {"jornada": 11, "date": "Sábado 17 de Enero de 2026", "home": "C.F Platges de Moncofa 'B'", "away": "Artana C.F.", "scoreHome": "3", "scoreAway": "2"},
        {"jornada": 11, "date": "Sábado 17 de Enero de 2026", "home": "C.D. Burriana F.B. 'B'", "away": "C.F. Nules 'C'", "scoreHome": "0", "scoreAway": "8"},
        {"jornada": 12, "date": "Sábado 24 de Enero de 2026", "home": "Club Almenara Atlètic 'B'", "away": "C.D. Burriana F.B. 'B'", "scoreHome": "3", "scoreAway": "1"},
        {"jornada": 12, "date": "Sábado 24 de Enero de 2026", "home": "C.D. Altura", "away": "La Vilavella C.F. 'A'", "scoreHome": "1", "scoreAway": "2"},
        {"jornada": 12, "date": "Sábado 24 de Enero de 2026", "home": "Artana C.F.", "away": "C.D. Soneja 'A'", "scoreHome": "2", "scoreAway": "2"},
        {"jornada": 12, "date": "Domingo 25 de Enero de 2026", "home": "C.D. Jérica", "away": "C.F. Sorinthule Football Pro Burriana 'B'", "scoreHome": "3", "scoreAway": "2"},
        {"jornada": 12, "date": "Domingo 25 de Enero de 2026", "home": "S.D. Asoc. Cult y Dptva. E. Mpal Futbol Llucena", "away": "Andiamo Vila-Real C.F. 'C'", "scoreHome": "2", "scoreAway": "3"},
        {"jornada": 12, "date": "Domingo 25 de Enero de 2026", "home": "C.F. Nules 'C'", "away": "C.F Platges de Moncofa 'B'", "scoreHome": "2", "scoreAway": "6"},
        {"jornada": 12, "date": "Domingo 25 de Enero de 2026", "home": "Xilxes C.F.", "away": "U.D. Vall de Uxó 'B'", "scoreHome": "2", "scoreAway": "2"},
        {"jornada": 13, "date": "Sábado 31 de Enero de 2026", "home": "C.F. Sorinthule Football Pro Burriana 'B'", "away": "Artana C.F.", "scoreHome": "2", "scoreAway": "4"},
        {"jornada": 13, "date": "Sábado 31 de Enero de 2026", "home": "C.F Platges de Moncofa 'B'", "away": "Club Almenara Atlètic 'B'", "scoreHome": "5", "scoreAway": "1"},
        {"jornada": 13, "date": "Sábado 31 de Enero de 2026", "home": "Andiamo Vila-Real C.F. 'C'", "away": "Xilxes C.F.", "scoreHome": "0", "scoreAway": "2"},
        {"jornada": 13, "date": "Sábado 31 de Enero de 2026", "home": "U.D. Vall de Uxó 'B'", "away": "C.D. Altura", "scoreHome": "1", "scoreAway": "4"},
        {"jornada": 13, "date": "Sábado 31 de Enero de 2026", "home": "La Vilavella C.F. 'A'", "away": "C.D. Jérica", "scoreHome": "6", "scoreAway": "1"},
        {"jornada": 13, "date": "Sábado 31 de Enero de 2026", "home": "C.D. Soneja 'A'", "away": "C.F. Nules 'C'", "scoreHome": "1", "scoreAway": "3"},
        {"jornada": 13, "date": "Sábado 31 de Enero de 2026", "home": "C.D. Burriana F.B. 'B'", "away": "S.D. Asoc. Cult y Dptva. E. Mpal Futbol Llucena", "scoreHome": "2", "scoreAway": "1"},
        {"jornada": 14, "date": "Sábado 7 de Febrero de 2026", "home": "La Vilavella C.F. 'A'", "away": "Artana C.F.", "scoreHome": "7", "scoreAway": "2"},
        {"jornada": 14, "date": "Sábado 7 de Febrero de 2026", "home": "C.D. Burriana F.B. 'B'", "away": "Andiamo Vila-Real C.F. 'C'", "scoreHome": "2", "scoreAway": "3"},
        {"jornada": 14, "date": "Sábado 7 de Febrero de 2026", "home": "C.F. Sorinthule Football Pro Burriana 'B'", "away": "C.F. Nules 'C'", "scoreHome": "2", "scoreAway": "7"},
        {"jornada": 14, "date": "Sábado 7 de Febrero de 2026", "home": "U.D. Vall de Uxó 'B'", "away": "C.D. Jérica", "scoreHome": "2", "scoreAway": "4"},
        {"jornada": 14, "date": "Sábado 7 de Febrero de 2026", "home": "C.D. Soneja 'A'", "away": "Club Almenara Atlètic 'B'", "scoreHome": "2", "scoreAway": "5"},
        {"jornada": 14, "date": "Sábado 7 de Febrero de 2026", "home": "C.D. Altura", "away": "Xilxes C.F.", "scoreHome": "3", "scoreAway": "3"},
        {"jornada": 14, "date": "Sábado 7 de Febrero de 2026", "home": "C.F Platges de Moncofa 'B'", "away": "S.D. Asoc. Cult y Dptva. E. Mpal Futbol Llucena", "scoreHome": "5", "scoreAway": "0"},
        {"jornada": 15, "date": "Sábado 14 de Febrero de 2026", "home": "C.D. Jérica", "away": "C.D. Altura", "scoreHome": "4", "scoreAway": "1"},
        {"jornada": 15, "date": "Domingo 15 de Febrero de 2026", "home": "S.D. Asoc. Cult y Dptva. E. Mpal Futbol Llucena", "away": "C.D. Soneja 'A'", "scoreHome": "1", "scoreAway": "6"},
        {"jornada": 15, "date": "Domingo 15 de Febrero de 2026", "home": "Andiamo Vila-Real C.F. 'C'", "away": "C.F Platges de Moncofa 'B'", "scoreHome": "2", "scoreAway": "5"},
        {"jornada": 15, "date": "Domingo 15 de Febrero de 2026", "home": "Xilxes C.F.", "away": "C.D. Burriana F.B. 'B'", "scoreHome": "10", "scoreAway": "0"},
        {"jornada": 15, "date": "Domingo 15 de Febrero de 2026", "home": "Club Almenara Atlètic 'B'", "away": "C.F. Sorinthule Football Pro Burriana 'B'", "scoreHome": "4", "scoreAway": "1"},
        {"jornada": 15, "date": "Domingo 15 de Febrero de 2026", "home": "Artana C.F.", "away": "U.D. Vall de Uxó 'B'", "scoreHome": "4", "scoreAway": "3"},
        {"jornada": 15, "date": "Domingo 15 de Febrero de 2026", "home": "C.F. Nules 'C'", "away": "La Vilavella C.F. 'A'", "scoreHome": "1", "scoreAway": "4"},
        {"jornada": 16, "date": "Sábado 21 de Febrero de 2026", "home": "La Vilavella C.F. 'A'", "away": "Club Almenara Atlètic 'B'", "scoreHome": "10", "scoreAway": "0"},
        {"jornada": 16, "date": "Sábado 21 de Febrero de 2026", "home": "C.F Platges de Moncofa 'B'", "away": "C.D. Burriana F.B. 'B'", "scoreHome": "6", "scoreAway": "1"},
        {"jornada": 16, "date": "Sábado 21 de Febrero de 2026", "home": "C.D. Altura", "away": "Artana C.F.", "scoreHome": "4", "scoreAway": "5"},
        {"jornada": 16, "date": "Sábado 21 de Febrero de 2026", "home": "U.D. Vall de Uxó 'B'", "away": "C.F. Nules 'C'", "scoreHome": "1", "scoreAway": "9"},
        {"jornada": 16, "date": "Sábado 21 de Febrero de 2026", "home": "C.D. Soneja 'A'", "away": "Andiamo Vila-Real C.F. 'C'", "scoreHome": "7", "scoreAway": "1"},
        {"jornada": 16, "date": "Domingo 22 de Febrero de 2026", "home": "C.F. Sorinthule Football Pro Burriana 'B'", "away": "S.D. Asoc. Cult y Dptva. E. Mpal Futbol Llucena", "scoreHome": "3", "scoreAway": "0"},
        {"jornada": 16, "date": "Domingo 22 de Febrero de 2026", "home": "C.D. Jérica", "away": "Xilxes C.F.", "scoreHome": "3", "scoreAway": "0"},
        {"jornada": 17, "date": "Sábado 28 de Febrero de 2026", "home": "Xilxes C.F.", "away": "C.F Platges de Moncofa 'B'", "scoreHome": "3", "scoreAway": "6"},
        {"jornada": 17, "date": "Sábado 28 de Febrero de 2026", "home": "S.D. Asoc. Cult y Dptva. E. Mpal Futbol Llucena", "away": "La Vilavella C.F. 'A'", "scoreHome": "2", "scoreAway": "8"},
        {"jornada": 17, "date": "Sábado 28 de Febrero de 2026", "home": "Club Almenara Atlètic 'B'", "away": "U.D. Vall de Uxó 'B'", "scoreHome": "9", "scoreAway": "1"},
        {"jornada": 17, "date": "Sábado 28 de Febrero de 2026", "home": "Andiamo Vila-Real C.F. 'C'", "away": "C.F. Sorinthule Football Pro Burriana 'B'", "scoreHome": "1", "scoreAway": "1"},
        {"jornada": 17, "date": "Sábado 28 de Febrero de 2026", "home": "Artana C.F.", "away": "C.D. Jérica", "scoreHome": "4", "scoreAway": "2"},
        {"jornada": 17, "date": "Sábado 28 de Febrero de 2026", "home": "C.F. Nules 'C'", "away": "C.D. Altura", "scoreHome": "3", "scoreAway": "4"},
        {"jornada": 17, "date": "Sábado 28 de Febrero de 2026", "home": "C.D. Burriana F.B. 'B'", "away": "C.D. Soneja 'A'", "scoreHome": "1", "scoreAway": "0"},
        {"jornada": 18, "date": "Viernes 6 de Marzo de 2026", "home": "Artana C.F.", "away": "Xilxes C.F.", "scoreHome": "1", "scoreAway": "1"},
        {"jornada": 18, "date": "Sábado 7 de Marzo de 2026", "home": "U.D. Vall de Uxó 'B'", "away": "S.D. Asoc. Cult y Dptva. E. Mpal Futbol Llucena", "scoreHome": "4", "scoreAway": "3"},
        {"jornada": 18, "date": "Sábado 7 de Marzo de 2026", "home": "La Vilavella C.F. 'A'", "away": "Andiamo Vila-Real C.F. 'C'", "scoreHome": "7", "scoreAway": "0"},
        {"jornada": 18, "date": "Sábado 7 de Marzo de 2026", "home": "C.D. Altura", "away": "Club Almenara Atlètic 'B'", "scoreHome": "4", "scoreAway": "2"},
        {"jornada": 18, "date": "Sábado 7 de Marzo de 2026", "home": "C.D. Soneja 'A'", "away": "C.F Platges de Moncofa 'B'", "scoreHome": "4", "scoreAway": "7"},
        {"jornada": 18, "date": "Sábado 7 de Marzo de 2026", "home": "C.F. Sorinthule Football Pro Burriana 'B'", "away": "C.D. Burriana F.B. 'B'", "scoreHome": "2", "scoreAway": "2"},
        {"jornada": 18, "date": "Domingo 8 de Marzo de 2026", "home": "C.D. Jérica", "away": "C.F. Nules 'C'", "scoreHome": "4", "scoreAway": "3"},
        {"jornada": 19, "date": "Sábado 21 de Marzo de 2026", "home": "C.F Platges de Moncofa 'B'", "away": "C.F. Sorinthule Football Pro Burriana 'B'", "scoreHome": "3", "scoreAway": "1"},
        {"jornada": 19, "date": "Sábado 21 de Marzo de 2026", "home": "C.D. Burriana F.B. 'B'", "away": "La Vilavella C.F. 'A'", "scoreHome": "1", "scoreAway": "3"},
        {"jornada": 19, "date": "Sábado 21 de Marzo de 2026", "home": "Andiamo Vila-Real C.F. 'C'", "away": "U.D. Vall de Uxó 'B'", "scoreHome": "3", "scoreAway": "6"},
        {"jornada": 19, "date": "Sábado 21 de Marzo de 2026", "home": "C.F. Nules 'C'", "away": "Artana C.F.", "scoreHome": "7", "scoreAway": "4"},
        {"jornada": 19, "date": "Sábado 21 de Marzo de 2026", "home": "Club Almenara Atlètic 'B'", "away": "C.D. Jérica", "scoreHome": "2", "scoreAway": "5"},
        {"jornada": 19, "date": "Sábado 21 de Marzo de 2026", "home": "Xilxes C.F.", "away": "C.D. Soneja 'A'", "scoreHome": "1", "scoreAway": "1"},
        {"jornada": 19, "date": "Sábado 21 de Marzo de 2026", "home": "S.D. Asoc. Cult y Dptva. E. Mpal Futbol Llucena", "away": "C.D. Altura", "scoreHome": "4", "scoreAway": "4"},
        {"jornada": 20, "date": "Sábado 28 de Marzo de 2026", "home": "Artana C.F.", "away": "Club Almenara Atlètic 'B'", "scoreHome": "3", "scoreAway": "3"},
        {"jornada": 20, "date": "Sábado 28 de Marzo de 2026", "home": "La Vilavella C.F. 'A'", "away": "C.F Platges de Moncofa 'B'", "scoreHome": "2", "scoreAway": "2"},
        {"jornada": 20, "date": "Sábado 28 de Marzo de 2026", "home": "C.D. Jérica", "away": "S.D. Asoc. Cult y Dptva. E. Mpal Futbol Llucena", "scoreHome": "7", "scoreAway": "1"},
        {"jornada": 20, "date": "Sábado 28 de Marzo de 2026", "home": "U.D. Vall de Uxó 'B'", "away": "C.D. Burriana F.B. 'B'", "scoreHome": "7", "scoreAway": "2"},
        {"jornada": 20, "date": "Sábado 28 de Marzo de 2026", "home": "C.F. Nules 'C'", "away": "Xilxes C.F.", "scoreHome": "5", "scoreAway": "1"},
        {"jornada": 20, "date": "Sábado 28 de Marzo de 2026", "home": "C.D. Altura", "away": "Andiamo Vila-Real C.F. 'C'", "scoreHome": "9", "scoreAway": "1"},
        {"jornada": 20, "date": "Domingo 29 de Marzo de 2026", "home": "C.F. Sorinthule Football Pro Burriana 'B'", "away": "C.D. Soneja 'A'", "scoreHome": "2", "scoreAway": "1"},
        {"jornada": 21, "date": "Sábado 4 de Abril de 2026", "home": "Xilxes C.F.", "away": "C.F. Sorinthule Football Pro Burriana 'B'", "scoreHome": "2", "scoreAway": "1"},
        {"jornada": 21, "date": "Sábado 4 de Abril de 2026", "home": "C.F Platges de Moncofa 'B'", "away": "U.D. Vall de Uxó 'B'", "scoreHome": "5", "scoreAway": "4"},
        {"jornada": 21, "date": "Sábado 4 de Abril de 2026", "home": "Club Almenara Atlètic 'B'", "away": "C.F. Nules 'C'", "scoreHome": "3", "scoreAway": "6"},
        {"jornada": 21, "date": "Sábado 4 de Abril de 2026", "home": "Andiamo Vila-Real C.F. 'C'", "away": "C.D. Jérica", "scoreHome": "1", "scoreAway": "10"},
        {"jornada": 21, "date": "Sábado 4 de Abril de 2026", "home": "C.D. Soneja 'A'", "away": "La Vilavella C.F. 'A'", "scoreHome": "1", "scoreAway": "4"},
        {"jornada": 21, "date": "Sábado 4 de Abril de 2026", "home": "C.D. Burriana F.B. 'B'", "away": "C.D. Altura", "scoreHome": "1", "scoreAway": "5"},
        {"jornada": 21, "date": "Domingo 5 de Abril de 2026", "home": "S.D. Asoc. Cult y Dptva. E. Mpal Futbol Llucena", "away": "Artana C.F.", "scoreHome": "5", "scoreAway": "4"},
        {"jornada": 22, "date": "Sábado 18 de Abril de 2026", "home": "La Vilavella C.F. 'A'", "away": "C.F. Sorinthule Football Pro Burriana 'B'", "scoreHome": "5", "scoreAway": "1"},
        {"jornada": 22, "date": "Sábado 18 de Abril de 2026", "home": "Artana C.F.", "away": "Andiamo Vila-Real C.F. 'C'", "scoreHome": "3", "scoreAway": "3"},
        {"jornada": 22, "date": "Sábado 18 de Abril de 2026", "home": "Club Almenara Atlètic 'B'", "away": "Xilxes C.F.", "scoreHome": "2", "scoreAway": "0"},
        {"jornada": 22, "date": "Sábado 18 de Abril de 2026", "home": "C.F. Nules 'C'", "away": "S.D. Asoc. Cult y Dptva. E. Mpal Futbol Llucena", "scoreHome": "6", "scoreAway": "3"},
        {"jornada": 22, "date": "Domingo 19 de Abril de 2026", "home": "C.D. Jérica", "away": "C.D. Burriana F.B. 'B'", "scoreHome": "10", "scoreAway": "1"},
        {"jornada": 22, "date": "Domingo 19 de Abril de 2026", "home": "C.D. Altura", "away": "C.F Platges de Moncofa 'B'", "scoreHome": "0", "scoreAway": "4"},
        {"jornada": 22, "date": "Domingo 19 de Abril de 2026", "home": "U.D. Vall de Uxó 'B'", "away": "C.D. Soneja 'A'", "scoreHome": "4", "scoreAway": "2"},
        {"jornada": 23, "date": "Viernes 24 de Abril de 2026", "home": "C.D. Soneja 'A'", "away": "C.D. Altura", "scoreHome": "2", "scoreAway": "4"},
        {"jornada": 23, "date": "Sábado 25 de Abril de 2026", "home": "S.D. Asoc. Cult y Dptva. E. Mpal Futbol Llucena", "away": "Club Almenara Atlètic 'B'", "scoreHome": "2", "scoreAway": "5"},
        {"jornada": 23, "date": "Sábado 25 de Abril de 2026", "home": "C.F. Sorinthule Football Pro Burriana 'B'", "away": "U.D. Vall de Uxó 'B'", "scoreHome": "1", "scoreAway": "3"},
        {"jornada": 23, "date": "Sábado 25 de Abril de 2026", "home": "Xilxes C.F.", "away": "La Vilavella C.F. 'A'", "scoreHome": "2", "scoreAway": "2"},
        {"jornada": 23, "date": "Sábado 25 de Abril de 2026", "home": "Andiamo Vila-Real C.F. 'C'", "away": "C.F. Nules 'C'", "scoreHome": "0", "scoreAway": "10"},
        {"jornada": 23, "date": "Sábado 25 de Abril de 2026", "home": "C.D. Burriana F.B. 'B'", "away": "Artana C.F.", "scoreHome": "3", "scoreAway": "6"},
        {"jornada": 23, "date": "Domingo 26 de Abril de 2026", "home": "C.F Platges de Moncofa 'B'", "away": "C.D. Jérica", "scoreHome": "2", "scoreAway": "1"},
        {"jornada": 24, "date": "Viernes 1 de Mayo de 2026", "home": "Artana C.F.", "away": "C.F Platges de Moncofa 'B'", "scoreHome": "2", "scoreAway": "6"},
        {"jornada": 24, "date": "Sábado 2 de Mayo de 2026", "home": "U.D. Vall de Uxó 'B'", "away": "La Vilavella C.F. 'A'", "scoreHome": "3", "scoreAway": "6"},
        {"jornada": 24, "date": "Sábado 2 de Mayo de 2026", "home": "C.D. Altura", "away": "C.F. Sorinthule Football Pro Burriana 'B'", "scoreHome": "5", "scoreAway": "0"},
        {"jornada": 24, "date": "Sábado 2 de Mayo de 2026", "home": "C.F. Nules 'C'", "away": "C.D. Burriana F.B. 'B'", "scoreHome": "8", "scoreAway": "0"},
        {"jornada": 24, "date": "Sábado 2 de Mayo de 2026", "home": "S.D. Asoc. Cult y Dptva. E. Mpal Futbol Llucena", "away": "Xilxes C.F.", "scoreHome": "4", "scoreAway": "5"},
        {"jornada": 24, "date": "Sábado 2 de Mayo de 2026", "home": "Club Almenara Atlètic 'B'", "away": "Andiamo Vila-Real C.F. 'C'", "scoreHome": "9", "scoreAway": "3"},
        {"jornada": 24, "date": "Domingo 3 de Mayo de 2026", "home": "C.D. Jérica", "away": "C.D. Soneja 'A'", "scoreHome": "3", "scoreAway": "0"}
    ],

    async importData() {
        try {
            console.log("Starting FFCV Import...");
            
            // 1. Ensure Season exists
            let season = await MoncofaApp.DB.seasons.where('name').equals('Temporada 2025/26').first();
            if (!season) {
                const id = await MoncofaApp.DB.seasons.add({
                    name: 'Temporada 2025/26',
                    category: 'Benjamin Mixt Castello G2',
                    isCurrent: 1
                });
                season = { id, name: 'Temporada 2025/26' };
                // Set others to not current
                await MoncofaApp.DB.seasons.where('id').notEqual(id).modify({ isCurrent: 0 });
            }
            const seasonId = season.id;

            // 2. Identify and Create Teams
            const teamNames = new Set();
            this.ffcvData.forEach(m => {
                teamNames.add(m.home);
                teamNames.add(m.away);
            });

            const teamMapping = {}; // Name -> ID
            for (const name of teamNames) {
                let team = await MoncofaApp.DB.league_teams.where({ seasonId, name }).first();
                if (!team) {
                    const isUs = name.includes("Platges de Moncofa");
                    const id = await MoncofaApp.DB.league_teams.add({
                        seasonId,
                        name,
                        isUs: isUs ? 1 : 0,
                        logo: null
                    });
                    team = { id, name };
                }
                teamMapping[name] = team.id;
            }

            // 3. Import Matches
            console.log(`Importing ${this.ffcvData.length} matches...`);
            
            // Clear existing calendar for this season to avoid duplicates
            await MoncofaApp.DB.calendar_matches.where('seasonId').equals(seasonId).delete();

            for (const m of this.ffcvData) {
                const homeId = teamMapping[m.home];
                const awayId = teamMapping[m.away];
                const isOurMatch = m.home.includes("Platges de Moncofa") || m.away.includes("Platges de Moncofa");

                await MoncofaApp.DB.calendar_matches.add({
                    seasonId,
                    matchday: m.jornada,
                    homeTeamId: homeId,
                    awayTeamId: awayId,
                    homeScore: parseInt(m.scoreHome),
                    awayScore: parseInt(m.scoreAway),
                    isPlayed: true,
                    isOurMatch: isOurMatch ? 1 : 0,
                    date: m.date
                });
            }

            console.log("Import successful!");
            MoncofaApp.UI.showCustomModal("Éxito", "Datos de la FFCV importados correctamente para la Temporada 2025/26.");
            
            // Refresh UI if in League view
            if (MoncofaApp.LeagueUI) {
                await MoncofaApp.LeagueUI.init();
            }

        } catch (e) {
            console.error("Import Error:", e);
            MoncofaApp.UI.showCustomModal("Error", "Error al importar datos: " + e.message);
        }
    }
};
