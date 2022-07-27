$(document).ready(function () {

    let valeurs_rachat = [];
    let type_versement = 'mensuel';
    let prime = 0;
    let is_assure = true;

    document.querySelectorAll('.input-date').forEach(function (el) {

        IMask(el, {
            mask: Date,  // enable date mask

            // other options are optional
            pattern: '`d/`m/Y',  // Pattern mask with defined blocks, default is 'd{.}`m{.}`Y'
            // you can provide your own blocks definitions, default blocks for date mask are:
            blocks: {
                d: {
                    mask: IMask.MaskedRange,
                    from: 1,
                    to: 31,
                    maxLength: 2,
                },
                m: {
                    mask: IMask.MaskedRange,
                    from: 1,
                    to: 12,
                    maxLength: 2,
                },
                Y: {
                    mask: IMask.MaskedRange,
                    from: 1900,
                    to: 9999,
                }
            },

            // define date -> str convertion
            format: function (date) {
                var day = date.getDate();
                var month = date.getMonth() + 1;
                var year = date.getFullYear();

                if (day < 10) day = "0" + day;
                if (month < 10) month = "0" + month;

                return [day, month, year].join('/');
            },
            // define str -> date convertion
            parse: function (str) {
                var dayMonthYear = str.split('/');
                return new Date(dayMonthYear[2], dayMonthYear[1] - 1, dayMonthYear[0]);
            },

            // optional interval options
            max: new Date(9999, 11, 31),

            autofix: true,  // defaults to `false`

            // also Pattern options can be set
            lazy: false,

            // and other common options
            overwrite: true  // defaults to `false`
        });
    })

    document.querySelectorAll('.input-date-effet').forEach(function (el) {
        IMask(el, {
            mask: Date,
            min: new Date(),
            lazy: false
        });
    })

    document.querySelectorAll('.input-phone').forEach(function (el) {
        IMask(el, {
            mask: '000 00 00 00'
        });
    })

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
    })

    $('button[data-hide]').click(function () {
        const toHide = $(this).data("hide");
        $(`#${toHide}`).hide();
    });

    $('button[data-show]').click(function () {
        const toHide = $(this).data("show");
        $(`#${toHide}`).show();
    });

    $(".btn-radio").click(function () {
        const el = $(this);
        const radio = el.data('radio');
        $(`button[data-radio="${radio}"]`).removeClass('btn-rouge');
        el.addClass('btn-rouge');
    });

    $("#btn-assure-oui").click(function () {
        fill_assure();
        is_assure = true;
    });

    $("#btn-assure-non").click(function () {
        $('input[name="souscriptions[ass_nom]"]').val("");
        $('input[name="souscriptions[ass_naiss]"]').val("__/__/____");
        $('input[name="souscriptions[ass_tel]"]').val("");
        $('input[name="souscriptions[ass_adr]"]').val("");
        $('input[name="souscriptions[ass_email]"]').val("");
        is_assure = false;
    });

    $(".btn-type-mensuel").click(function () {
        $(this).removeClass('btn-simple');
        $(this).addClass('btn-rouge');
        $(".btn-type-unique").removeClass('btn-rouge');
        $(".btn-type-unique").addClass('btn-simple');
        type_versement = 'mensuel';
        prime = valeurs_rachat['prime_mensuelle'];
        update_valeurs_rachat();
    });

    $(".btn-type-unique").click(function () {
        $(this).removeClass('btn-simple');
        $(this).addClass('btn-rouge');
        $(".btn-type-mensuel").removeClass('btn-rouge');
        $(".btn-type-mensuel").addClass('btn-simple');
        type_versement = 'unique';
        prime = valeurs_rachat['prime_unique'];
        update_valeurs_rachat();
    });

    $('.btn-calcul-prime').click(function () {
        calcul_prime();
    });

    const barres = $(".barres");

    barres.click(function () {
        if (barres.hasClass("menu-close")) {
            barres.find("span").text("FERMER");
            $(".menu-items").show();
            $(".menu-items > div").html($(".main-nav").html());
            $(".menu-items li").click(function () {
                closeMenu();
            });
            barres.toggleClass("menu-close menu-open");
        } else {
            closeMenu();
        }
    });

    function fill_assure() {
        $('input[name="souscriptions[ass_nom]"]').val($('input[name="souscriptions[sous_nom]"]').val());
        $('input[name="souscriptions[ass_naiss]"]').val($('input[name="souscriptions[sous_naiss]"]').val());
        $('input[name="souscriptions[ass_tel]"]').val($('input[name="souscriptions[sous_tel]"]').val());
        $('input[name="souscriptions[ass_adr]"]').val($('input[name="souscriptions[sous_adr]"]').val());
        $('input[name="souscriptions[ass_email]"]').val($('input[name="souscriptions[sous_email]"]').val());
    }

    function closeMenu() {
        barres.find("span").text("MENU");
        $(".menu-items").hide();
        barres.toggleClass("menu-close menu-open");
    }

    let dateNaiss = "";
    let nbRente = "";
    let duree = "";
    let rente = "";
    let primeMensuelle = "";
    let primeUnique = "";

    // Gestion du formulaire
    $("#form-sec-assure, #form-sec-cotisation, #simulation_form, #form-sec-souscription").submit(function (e) {
        e.preventDefault();
    });

    $("#btn-submit-souscription").click(function (e) {
        souscrire();
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
        if (is_assure) fill_assure();

        if ($('input[name="souscriptions[ass_naiss]"]').val().includes('_') ||
            $('input[name="souscriptions[rente]"]').val() == 0) return;

        let data = {};
        $("input[name]").each(function (i, el) {
            el = $(el);
            console.log(el.prop('name'), el.prop('value'));
            data[el.prop('name')] = el.prop('value');
        })
        $.post('business/calcul_garantie.php', data, function (res) {
            console.log(res);
            valeurs_rachat = res;
            update_valeurs_rachat();
        })
    }

    function souscrire() {
        if (is_assure) fill_assure();

        if ($('input[name="souscriptions[ass_naiss]"]').val().includes('_') ||
            $('input[name="souscriptions[rente]"]').val() == 0) return;

        let data = {};
        $("input[name]").each(function (i, el) {
            el = $(el);
            console.log(el.prop('name'), el.prop('value'));
            data[el.prop('name')] = el.prop('value');
        })

        // periodicite de la cotisation
        data['souscriptions[periodicite]'] = type_versement;

        // periodicite de la cotisation
        data['souscriptions[prime]'] = prime;

        // L'age tarife
        // Date de naissance
        dateNaiss = $('input[name="souscriptions[ass_naiss]"]').val();
        const assDate = dateNaiss.split("/");
        if (assDate.length > 2)
            data['souscriptions[ass_age]'] = new Date().getFullYear() - assDate[2];

        // Valeurs de rachat
        data['souscriptions[valeurs]'] = JSON.stringify(valeurs_rachat[type_versement]);

        $.post('business/souscrire.php', data, function (res) {
            $('.message').text(res);
            const response = JSON.parse(res);
            if (!response.error) {
                location.href = 'success.php?pid=' + response.uuid;
            }
        })
    }

    function update_valeurs_rachat() {
        $("div[data-rachat]").each(function (i, el) {
            $(el).text(valeurs_rachat[type_versement][i] + " F CFA");
        });
        $('.prime-mensuelle').text(valeurs_rachat['prime_mensuelle']);
        $('.prime-unique').text(valeurs_rachat['prime_unique']);

        prime = type_versement == 'mensuel' ? valeurs_rachat['prime_mensuelle'] : valeurs_rachat['prime_unique'];
    }

    $("#modal_resultat").on("show.bs.modal", function (event) {
        var modal = $(this);
    });

    calcul_prime();
});