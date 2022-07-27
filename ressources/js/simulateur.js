$(document).ready(function () {

    let mortalite = [];

    let dateNaiss = "";
    let nb_rentes = "";
    let duree = "";
    let rente = "";
    let primeMensuelle = "";
    let primeUnique = "";

    // Les taux
    const gr = 0.03;
    const g1 = 0.0015;
    const g2 = 0.001;
    const g3 = 0.06;

    loadParams();

    document.querySelectorAll('.input-date').forEach(function (el) {
        IMask(el, {
            mask: Date,
            max: new Date(2021, 11, 31),
            lazy: false
        });
    });

    document.querySelectorAll('.input-date-effet').forEach(function (el) {
        IMask(el, {
            mask: Date,
            min: new Date(),
            lazy: false
        });
    });

    document.querySelectorAll('.input-phone').forEach(function (el) {
        IMask(el, {
            mask: '000 00 00 00'
        });
    });

    document.querySelectorAll('.input-montant').forEach(function (el) {
        IMask(el, {
            mask: 'num',
            blocks: {
                num: {
                    mask: Number,
                    thousandsSeparator: '.'
                }
            }
        });
    });

    // Gestion du formulaire
    $("#form-simulateur").submit(function (e) {
        e.preventDefault();
        calcul_prime();
    });

    function separateur(a, b) {
        a = "" + a;
        b = b || ".";
        var c = "",
            d = 0;
        while (a.match(/^0[0-9]/)) {
            a = a.substr(1);
        }
        for (var i = a.length - 1; i >= 0; i--) {
            c = d != 0 && d % 3 == 0 ? a[i] + b + c : a[i] + c;
            d++;
        }
        return c;
    }

    function calcul_prime() {
        if ($('input[name="simu[date_naissance]"]').val().includes('_') ||
            $('input[name="simu[rente]"]').val() == 0) return;

        let data = {};
        $("input[name]").each(function (i, el) {
            el = $(el);
            //console.log(el.prop('name'), el.prop('value'));
            data[el.prop('name')] = el.prop('value');
        });

        /* Validation des données */

        // Date de naissance
        dateNaiss = $('input[name="simu[date_naissance]"]').val();
        const userDate = dateNaiss.split(".");
        if (userDate.length < 3) return;
        const x = new Date().getFullYear() - userDate[2];

        $('#resultats').hide();
        $('#btn-simuler').hide();
        $('.message').show();

        // Montant de la rente
        rente = $('input[name="simu[rente]"]').val().replaceAll(".", "");

        // Duree du contrat
        n = parseInt($('input[name="simu[duree]"]').val());

        // Nombre de rente
        nb_rentes = parseInt($('input[name="simu[nb]"]').val());

        // Les parametres pour x
        const paramsX = mortalite[x];
        const Dx = paramsX.dxc;
        const Mx = paramsX.Mx;
        const Nx = paramsX.Nx;

        // Les parametres pour x + n
        const paramsXn = mortalite[x + n];
        const Dxn = paramsXn.dxc;
        const Mxn = paramsXn.Mx;
        const Nxn = paramsXn.Nx;

        const axn = (Nx - Nxn) / Dx;

        const garantie_1 = garantieVie(rente, nb_rentes, Dx, Dxn);
        const garantie_2 = garantieDecesPonctuel(rente, Dx, Mx, Mxn);
        const garantie_3 = garantieDecesContinu(rente, n, x);
        const garantie_4 = garantieDecesCertaine(rente, n, x, nb_rentes);

        // Calcul de la prime pure
        const prime_unique_pure = garantie_1 + garantie_2 + garantie_3 + garantie_4;

        // Calcul des chargements
        //-----------------------
        const cr = Cr(rente, nb_rentes);
        const cm = Cm(rente, n, nb_rentes);

        // 1. Chargement de gestion
        const charg_gestion = chargementGestion(prime_unique_pure);

        // 2. Chargement en cas de vie
        const charg_cas_vie = g1 * cr;

        // 3. Chargement en cas de décès
        const charg_cas_deces = g2 * cm;

        // Prime unique d'inventaire
        const prime_unique_inventaire = prime_unique_pure * (1 + gr) + g1 * cr * axn + g2 * cm * axn;

        // Prime annuelle d'inventaire
        const prime_annuelle_inventaire = prime_unique_inventaire / axn;

        // Prime unique commerciale
        const prime_unique_commerciale = prime_unique_inventaire / (1 - g3);

        // Prime unique affichée au client
        const prime_unique_affichee = separateur(Math.round(prime_unique_commerciale));

        // Prime annuelle commerciale
        const prime_annuelle_commerciale = prime_annuelle_inventaire / (1 - g3);

        // Prime mensuelle commerciale
        const prime_mensuelle_commerciale = prime_annuelle_commerciale * ((Nx - Nxn) / (Nx - Nxn - ((11 / 24) * (Dx - Dxn)))) * (1 / 12);
        const prime_mensuelle_affichee    = separateur(Math.round(prime_mensuelle_commerciale));

        $('.prime-mensuelle').text(prime_mensuelle_affichee + ' F CFA')
        $('.prime-unique').text(prime_unique_affichee + ' F CFA')

        $('.message').hide();
        $('#resultats').show();
        $('#btn-simuler').show();
    }

    $("#modal_resultat").on("show.bs.modal", function (event) {
        var modal = $(this);
    });

    function loadParams() {
        $('#btn-simuler').hide();
        for (let i = 0; i <= 106; i++) {
            $.get(`mortalite/${i}.json`, function (params) {
                mortalite[params.x] = params;
                if (mortalite.length === 107) {
                    $('#btn-simuler').show();
                }
            });

        }
    }

    function garantieVie(rente, nb_rentes, Dx, Dxn) {
        const i = 0.035;
        const V = 1 / (1 + i);

        let num = 0;
        let denum = 1;

        num = rente * (1 - (V ** nb_rentes)) * Dxn;
        denum = i * V * Dx;

        return num / denum;
    }

    function garantieDecesPonctuel(rente, Dx, Mx, Mxn) {
        const num = 0.5 * rente * (Mx - Mxn);
        const denum = Dx;

        return num / denum;
    }


    function garantieDecesContinu(rente, n, x) {
        const i = 0.035;
        const V = 1 / (1 + i);
        let somme = 0;

        for (let k = 0; k <= n - 1; k++) {
            let params = mortalite[x];
            const lx = params.lx;
            params = mortalite[x + k];
            const dxk = params.dx;

            somme += (dxk / lx) * (V ** k) * (1 - V ** (n - k));
        }

        return 0.5 * (1 / i) * rente * somme;
    }

    function garantieDecesCertaine(rente, n, x, m) {
        const i = 0.035;
        const V = 1 / (1 + i);
        let somme = 0;

        for (let k = 0; k <= n - 1; k++) {
            let params = mortalite[x];
            const lx = params.lx;
            params = mortalite[x + k];
            const dxk = params.dx;

            somme += (dxk / lx) * (V ** (n - 1)) * (1 - V ** m);
        }

        return (1 / i) * rente * somme;
    }

    function Cr(rente, m) {
        const i = 0.035;
        const V = 1 / (1 + i);

        const num = rente * (1 - V ** m);
        const denum = i * V;

        return (num / denum);
    }

    function Cm(rente, n, m) {
        const i = 0.035;
        const V = 1 / (1 + i);
        const N = n / 2;

        // Chargement deces 1
        const charg_deces_1 = 0.5 * rente * V ** N;

        // Chargement deces 2
        const charg_deces_2 = 0.5 * rente * (((1 + i) ** Math.floor(N)) - 1) * (1 / (i * (1 + i) ** (Math.floor(N) - 1)));

        // Chargement deces 3
        const charg_deces_3 = Cr(rente, m) * (V ** N);

        return charg_deces_1 + charg_deces_2 + charg_deces_3;
    }

    function chargementGestion(prime_unique_pure) {
        return 0.3 * prime_unique_pure;
    }
});