interface Config {
    baseurl: string;
    headers: object | "";
}

const token = localStorage.getItem("travelUserToken");
const apiConfig: Config = {
    baseurl: "http://localhost:5000/api/",
    headers: {
        "Authorization": `Bearer ${token}`
    }
};

export default apiConfig