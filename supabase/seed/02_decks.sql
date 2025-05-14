insert into
    decks (profile_id, category_id, name)
values
    (
        '00000000-0000-0000-0000-000000000000',
        (
            select
                id
            from
                categories
            where
                name = 'Programming'
        ),
        'JavaScript Basics'
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        (
            select
                id
            from
                categories
            where
                name = 'Geography'
        ),
        'World Capitals'
    );