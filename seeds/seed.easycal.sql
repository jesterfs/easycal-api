INSERT INTO members (name, email, password)
VALUES
('Bob', 'bob@gmail.com', 'password1'),
('Fred', 'fred@gmail.com', 'password2'),
('Stan', 'stan@gmail.com', 'password3'),
('Sally', 'sally@gmail.com', 'password4'),
('Deb', 'deb@gmail.com', 'password5'),
('Mary', 'mary@gmail.com', 'password6');

INSERT INTO calendars (name, owner)
VALUES 
('Calendar1', 1),
('Calendar2', 1),
('Calendar3', 2);


INSERT INTO member_calenders (member_id, calendar_id)
VALUES 
(1, 1),
(1, 2),
(1, 3),
(2, 2),
(2, 3),
(2, 1),
(3, 1),
(4, 1),
(5, 2),
(6, 3);

INSERT INTO events (name, start_time, end_time, calendar_id, owner_id)
VALUES
('Staff Meeting', '2020-10-01 12:00:00', '2020-10-01 13:00:00', 1, 1),
('Performance Review', '2020-10-02 12:00:00', '2020-10-02 13:00:00',  2, 2),
('Inventory', '2020-10-04 12:00:00', '2020-10-04 13:00:00',  3, 2);


INSERT INTO member_events (member_id, event_id)
VALUES
(1, 1),
(2, 2),
(5, 2),
(3, 1),
(4, 1),
(5, 1),
(1, 3),
(2, 3);

