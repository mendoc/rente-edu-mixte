$(document).ready(function () {

    $(".action-souscrire").click(function () {
        location.href = `souscription.php?rente=${rente}&mensuel=${primeMensuelle}&unique=${primeUnique}&nom=${nom}&telephone=${telephone}&date_naiss=${dateNaiss}&duree=${duree}&nb_rentes=${nbRente}`;
    });

    $(".scroll-to-simulation").click(function () {
        $("html, body").animate(
            { scrollTop: $("#sec_fomulaire").offset().top },
            2000
        );
    });

    $(".js--scroll-to-start").click(function () {
        $("html, body").animate(
            { scrollTop: $(".js--scroll-to-start").offset().top },
            1000
        );
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

    function closeMenu() {
        barres.find("span").text("MENU");
        $(".menu-items").hide();
        barres.toggleClass("menu-close menu-open");
    }

    let nom = "";
    let telephone = "";
    let dateNaiss = "";
    let rente = 1;
    let duree = 1;
    let nbRente = 1;
    let primeMensuelle = 0;
    let primeUnique = 0;

    // Gestion du formulaire
    $("#simulation_form").submit(function (e) {
        e.preventDefault();

        console.log(dateMask);

        if (!dateMask) return;

        const userDate = dateMask.value.split("/");

        if (userDate.length < 3) return;

        nom = $("#nom").val();
        telephone = $("#phone").val();
        dateNaiss = $("#naissance").val();
        rente = $("#rente").val().replaceAll(".", "");
        duree = $("#duree_contrat").val();
        nbRente = $("#nbr_rente").val();

        $(".rente").text(separateur(rente));
        $(".nbr_rente").text(nbRente);
        $(".duree_contrat").text(duree);

        calcul_prime();
    });

    function calcul_prime() {
        if ($('input[name="souscriptions[ass_naiss]"]').val().includes('_') ||
            $('input[name="souscriptions[rente]"]').val() == 0) return;

        // Validation du numero de telephone
        let num = $('input[name="souscriptions[sous_tel]"]').val();
        num = num.replaceAll(' ', '');
        if (num.length !== 9 || (!num.startsWith('07') && !num.startsWith('06'))) {
            alert('Numéro de téléphone incorrect');
            return;
        }

        let data = {};
        $("input[name]").each(function (i, el) {
            el = $(el);
            //console.log(el.prop('name'), el.prop('value'));
            data[el.prop('name')] = el.prop('value');
        })

        // Affichage du message d'attente
        $(".message").show();
        $("#resultats").hide();

        $.post('business/calcul_garantie.php', data, function (data) {
            $(".prime-mensuelle").text(`${data.prime_mensuelle} F CFA`);
            $(".prime-unique").text(`${data.prime_unique} F CFA`);

            // Affichage des resultats
            $(".message").hide();
            $("#resultats").show();

            genererImage({
                nom: nom,
                tel: num,
                age: calcul_age(dateNaiss),
                rente: separateur(rente),
                duree: duree,
                nombre: nbRente,
                mensuel: data.prime_mensuelle,
                unique: data.prime_unique,
            });

            
        })
    }

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

    function calcul_age(dateNaiss) {
        // L'age tarife
        let age = 0;

        const assDate = dateNaiss.split("/");
        if (assDate.length > 2)
            age = new Date().getFullYear() - assDate[2];

        return age;
    }

    function date_du_jour() {
        const d = new Date();

        const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

        return `${jours[d.getDay() - 1]} ${d.getDate()} ${mois[d.getMonth()]} ${d.getFullYear()}`
    }

    $("#modal_resultat").on("show.bs.modal", function (event) {
        var modal = $(this);
    });

    function genererImage(data) {
        const canvas = document.getElementById('resultat');
        const h = 500;
        const w = 400;

        if (canvas.getContext) {
            let ctx = canvas.getContext('2d');

            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = '#000000';

            ctx.font = '28px Arial';
            ctx.textAlign = 'center'
            ctx.fillText('ASSUR\'EDUCATION', w / 2, h / 4.9);
            ctx.font = '18px Arial';
            ctx.fillText('Simulation', w / 2, h / 3.9);

            // Affichage du nom
            ctx.font = '25px Arial';
            ctx.fillText(data.nom, w / 2, h / 3);
            ctx.fillText(data.nom, w / 2, h / 3);

            // Affichage du numero de telephone
            ctx.font = '19px Arial';
            ctx.fillText(data.tel + ' - ' + data.age + ' ans', w / 2, h / 2.6);

            // Affichage de la rente
            ctx.font = '19px Arial';
            ctx.textAlign = 'start'
            ctx.fillText('Rente .................... : ' + data.rente + ' F CFA', w / 12, h / 2);

            // Affichage de la durée du contrat
            ctx.font = '19px Arial';
            ctx.textAlign = 'start'
            ctx.fillText('Durée du contrat ... : ' + data.duree + ' ans', w / 12, h / 1.83);

            // Affichage du nombre de rentes
            ctx.font = '19px Arial';
            ctx.textAlign = 'start'
            ctx.fillText('Nombre de rentes   : ' + data.nombre, w / 12, h / 1.7);

            // Affichage de la prime mensuelle
            ctx.font = '19px Arial';
            ctx.textAlign = 'start';
            let textOffset = ctx.measureText('Prime mensuelle ... : ').width;
            ctx.fillStyle = "#BA0C2F";
            ctx.fillText(data.mensuel + ' F CFA', textOffset + 35, h / 1.5);
            ctx.fillText(data.unique + ' F CFA', textOffset + 35, h / 1.4);
            ctx.fillStyle = '#000000';
            ctx.fillText('Prime mensuelle ... : ', w / 12, h / 1.5);

            // Affichage de la prime unique
            ctx.font = '19px Arial';
            ctx.textAlign = 'start'
            ctx.fillText('Prime unique ......... : ', w / 12, h / 1.4);

            // Affichage de la date du jour
            ctx.font = '19px Arial';
            ctx.textAlign = 'center'
            ctx.fillText(date_du_jour(), w / 2, h / 1.2);

            // Affichage du slogan
            ctx.fillStyle = "#BA0C2F";
            ctx.fillRect(0, h - 50, w, 50);

            ctx.font = '19px Arial';
            ctx.textAlign = 'center'
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText('Notre métier, l\'assurance.', w / 2, h - 20);

            ctx.strokeStyle = "#BA0C2F";
            ctx.strokeRect(1, 1, w - 2, h - 2);
            ctx.drawImage(document.getElementById('logo'), (w / 2) - 55, 3);

            $("#modal_image").modal("show");
        }
    }
});
/* images slider */
const panels = document.querySelectorAll(".img_slider");

panels.forEach((img_slider) => {
    img_slider.addEventListener("click", () => {
        removeActiveClasses();
        img_slider.classList.add("active");
    });
});
function removeActiveClasses() {
    panels.forEach((img_slider) => {
        img_slider.classList.remove("active");
    });
}
