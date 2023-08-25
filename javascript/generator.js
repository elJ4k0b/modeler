/*=================================
Script that handles the creation of diagrams and diagram elements
===================================*/

element1 = {
    position: {
        x: 2,
        y: 2,
    },
    width: 200,
    height: 200,
    title: "Hallo Welt!",
    id: "1",
    before: [],
    after: [2],
}
element2 = {
    position: {
        x: 5,
        y: 5,
    },
    width: 200,
    height: 200,
    title: "Hallo Welt!",
    id: "2",
    before: [1],
    after: [3],
}
element3 = {
    position: {
        x: 10,
        y: 10,
    },
    width: 200,
    height: 200,
    title: "Hallo Welt!",
    id: "3",
    before: [1,2],
    after: [],
}

element4 = {
    position: {
        x: 8,
        y: 5,
    },
    width: 200,
    height: 200,
    title: "Hallo Welt!",
    id: "4",
    before: [1,2,3],
    after: [1,2],
}
lines = [[13,1,2], [14,4,1], [15,4,2], [17,4,1], [20,2,3]]
elems = [element1, element2, element3, element4];



document.addEventListener("DOMContentLoaded", () => {
    //build_diagram(elems);
    add_container("1", "Organisation mit sehr sehr sehr langem Titel", 1, 1, 2000, 1000);
    add_element("2", "2", 2, 6, 1);
    add_element("3", "3", 4, 6, 1);
    add_element("4", "7", 6, 8, 1);
    set_start("3");
    add_element("5", "4", 6, 4, 1);
    add_element("6", "5", 10, 4, 1);
    add_element("7", "6", 10, 6, 1);
    /*add_relation(13, 4, 5);
    add_relation(9, 3, 7);
    add_relation(10, 3, 4);
    add_relation(8, 2, 3);
    add_relation(11, 5, 6);
    add_relation(12, 7, 6);*/
});

