export class AJAX {
    constructor() {
}

  static loadTextByPromise(url) {
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.onload = function() {
                if(xhr.status === 200) {
                    var data = xhr.response;
                    resolve(data);
                } else {
                    reject(xhr.status);
                }
            };
            xhr.onerror = function() {
                reject(Error('Network Error!'));
            }
            xhr.send(null);
        });
    }

}