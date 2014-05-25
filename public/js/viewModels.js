var masterViewModel = function(standardClaims, additionalClaims) {

    this.standardClaims = standardClaims;
    this.additionalClaims = ko.observableArray(additionalClaims);

    this.generatedClaimSet = ko.computed(function() {
        var claimSet =
            {
                iss : this.standardClaims.issuer(),
                iat : this.standardClaims.issuedAt(),
                exp : this.standardClaims.expiration(),
                aud : this.standardClaims.audience(),
                sub : this.standardClaims.subject()
            };

        var claims = this.additionalClaims();

        for(var i = 0; i < claims.length; i++) {
            var claimType = claims[i].claimType();
            var value = claims[i].value();

            if(!claimType || !value) continue;

            if(!claimSet[claimType]) {
                claimSet[claimType] = value;
            }
            else {
                var current = claimSet[claimType];
                if($.isArray(current)) {
                    current.push(value);
                }
                else {
                    var newArray = [];
                    newArray.push(current);
                    newArray.push(value);
                    claimSet[claimType] = newArray;
                }
            }
        }

        return JSON.stringify(claimSet, null, 4);
    }, this);

    self.issuedAtSetNow = function() {
        this.standardClaims.issuedAt(new Date().toISOString());
    };

    self.expirationSetNow = function() {
        this.standardClaims.expiration(new Date().toISOString());
    };

    self.expirationSetTwentyMinutes = function() {
        var now = new Date();
        var later = addMinutes(now, 20);
        this.standardClaims.expiration(later.toISOString());
    };

    self.expirationSetOneYear = function() {
        var now = new Date();
        var later = addMinutes(now, 365*24*60);
        this.standardClaims.expiration(later.toISOString());
    };

    self.clearAllAdditionalClaims = function() {
        while(this.additionalClaims().length > 0) {
            this.additionalClaims.pop();
        }
    };

    self.addOneAdditionalClaim = function() {
        this.additionalClaims.push(new claimViewModel("",""));
    };

    self.addEmailAdditionalClaim = function() {
        this.additionalClaims.push(new claimViewModel("Email","bee@example.com"));
    };

    this.warnings = ko.computed(function() {
        var warnings = [];

        var dt = new Date(this.standardClaims.issuedAt());
        if (isNaN(dt)) {
            warnings.push("IssuedAt is not a valid <a href=\"http://www.w3.org/TR/NOTE-datetime\">W3C date/time</a>. Must be formatted as: YYYY-MM-DDThh:mm:ssZ");
        }

        dt = new Date(this.standardClaims.expiration());
        if (isNaN(dt)) {
            warnings.push("Expiration  is not a valid <a href=\"http://www.w3.org/TR/NOTE-datetime\">W3C date/time</a>. Must be formatted as: YYYY-MM-DDThh:mm:ssZ");
        }

        return warnings;
    }, this);
};


var standardClaimsViewModel = function(issuer, issuedAt, expiration, audience, subject) {
    this.issuer = ko.observable(issuer);
    this.issuedAt = ko.observable(issuedAt);
    this.expiration = ko.observable(expiration);
    this.audience = ko.observable(audience);
    this.subject = ko.observable(subject);
};


var createMaster = function() {
    var standardClaims = new standardClaimsViewModel(
        "Online JWT Builder",
        "2014-07-14T08:30Z",
        "2014-07-16T19:20Z",
        "www.example.com",
        "jrocket@example.com"
    );

    var additionalClaims = [
        new claimViewModel("GivenName", "Johnny"),
        new claimViewModel("Surname", "Rocket"),
        new claimViewModel("Email", "jrocket@example.com"),
        new claimViewModel("Role", "Manager"),
        new claimViewModel("Role", "Project Administrator")];

    var master = new masterViewModel(standardClaims, additionalClaims);

    return master;
};

var claimViewModel = function(claimType, value) {
    this.claimType = ko.observable(claimType);
    this.value = ko.observable(value);
};