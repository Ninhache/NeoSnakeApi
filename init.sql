CREATE EXTENSION pgcrypto;

CREATE TABLE
    users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    );

----------------------------------------------------------------
----------------------------------------------------------------
--------------------- USER CREATION & ELSE ---------------------
----------------------------------------------------------------
----------------------------------------------------------------
-- INSERT INTO
--     users (username, password)
-- VALUES
--     (
--         'johndoe@mail.com',
--         crypt ('johnspassword', gen_salt ('bf'))
--     );
-------------- GOOD PASSWORD
-- SELECT
--     id
-- FROM
--     users
-- WHERE
--     email = 'johndoe@mail.com'
--     AND password = crypt ('johnspassword', password);
-------------- WRONG PASSWORD
-- SELECT
--     id
-- FROM
--     users
-- WHERE
--     email = 'johndoe@mail.com'
--     AND password = crypt ('not the password', password);