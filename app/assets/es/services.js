function Projects() {
    const URL = './json/projects.json';

    function loadProjects() {
        return AJAX.loadJsonByPromise(URL);
    }
    return {
        loadProjects: loadProjects
    }
};