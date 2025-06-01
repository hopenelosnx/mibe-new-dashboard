interface Config {
    baseurl: string;
    headers: object | "";
}

const token = localStorage.getItem("travelUserToken");
const apiConfig: Config = {
    baseurl: "https://mibes-new-backend-production-9834.up.railway.app/api/",
    headers: {
        "Authorization": `Bearer ${token}`
    }
};

export default apiConfig
