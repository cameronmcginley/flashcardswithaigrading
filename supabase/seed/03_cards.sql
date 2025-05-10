insert into
    cards (deck_id, front, back)
values
    (
        (
            select
                id
            from
                decks
            where
                name = 'JavaScript Basics'
        ),
        'What does `const` mean in JavaScript?',
        '`const` creates a block-scoped constant variable.'
    ),
    (
        (
            select
                id
            from
                decks
            where
                name = 'JavaScript Basics'
        ),
        'What is the result of `typeof null`?',
        '`object` — it is a historical bug in JS.'
    ),
    (
        (
            select
                id
            from
                decks
            where
                name = 'World Capitals'
        ),
        'What is the capital of Canada?',
        'Ottawa'
    ),
    (
        (
            select
                id
            from
                decks
            where
                name = 'World Capitals'
        ),
        'What is the capital of Brazil?',
        'Brasília'
    ); 