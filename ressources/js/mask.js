var maskPhoneOptions = {
    mask: '000 00 00 00'
};

var maskDateOptions = {
    mask: Date,
    min: new Date(1961, 0, 1),
    max: new Date(2000, 11, 31),
    lazy: false
};

montantMaskOptions = {
    mask: 'num',
    blocks: {
        num: {
            mask: Number,
            thousandsSeparator: '.'
        }
    }
};


const phoneEl = document.getElementById('phone');
const naissanceEl = document.getElementById('naissance');
const montantEl = document.getElementById('rente');

if (montantEl) {
    var montantMask = IMask(montantEl, montantMaskOptions);
}

var phoneMask = IMask(phoneEl, maskPhoneOptions);
//var dateMask = IMask(naissanceEl, maskDateOptions);


var dateMask = IMask(naissanceEl, {
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
    min: new Date(1961, 0, 1),
    max: new Date(2000, 11, 31),

    autofix: true,  // defaults to `false`

    // also Pattern options can be set
    lazy: false,

    // and other common options
    overwrite: true  // defaults to `false`
});