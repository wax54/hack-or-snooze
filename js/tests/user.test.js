describe('users', () => {
    describe('saveUserCredentialsInLocalStorage()', () => {
        it('should save the loginToken and username of currentUser to localStorage', () => {
            localStorage.clear();
            const TOKEN = 'SOME STRING, ANY STRING!';
            const UNAME = 'THEUSERNAME';
            const NAME = 'THE NAME';
            const CREATED_AT = new Date();
            currentUser = new User({ username: UNAME, name: NAME, createdAt: CREATED_AT }, TOKEN);

            expect(localStorage.token).toBe(undefined);
            expect(localStorage.username).toBe(undefined);
            saveUserCredentialsInLocalStorage();
            expect(localStorage.token).toEqual(TOKEN);
            expect(localStorage.username).toEqual(UNAME);

        });
    });

});