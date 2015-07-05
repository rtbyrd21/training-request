describe('trUser', function(){
    beforeEach(module('app'));

    describe('isAdmin', function(){
        it('should return false if user does not have admin in their roles array', inject(function(trUser){
            var user = new trUser();
            user.roles = ['not admin'];
            expect(user.isAdmin()).to.be.falsey;
        }))

        it('should return true if user has admin in their roles array', inject(function(trUser){
            var user = new trUser();
            user.roles = ['admin'];
            expect(user.isAdmin()).to.be.true;
        }))

    })

})