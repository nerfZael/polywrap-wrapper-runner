pub mod wrap;
use wrap::{*, imported::{ArgsLog, ArgsStart}};

pub fn main(_: ArgsMain) -> u8 {
    HttpServerModule::start(&ArgsStart {
        port: 3000,
        request_timeout: 10000, 
        routes: vec![
            HttpServerRoute {
                path: "/".to_string(),
                http_method: HttpServerHttpMethod::GET,
                handler: HttpServerWrapperCallback {
                    uri: "wrap://ens/server.pwr-app.eth".to_string(),
                    method: "routeHome".to_string()
                }
            }
        ], 
        on_start: Some(
            HttpServerWrapperCallback {
                uri: "wrap://ens/server.pwr-app.eth".to_string(),
                method: "onStart".to_string()
            }
        ),
    }).unwrap();

    0
}

pub fn on_start(_: ArgsOnStart) -> bool {
    LoggerModule::log(&ArgsLog {
        level: LoggerLogLevel::INFO,
        message: "Server started".to_string(),
    }).unwrap();

    true
}

pub fn route_home(_: ArgsRouteHome) -> HttpServerHttpResponse {
    LoggerModule::log(&ArgsLog {
        level: LoggerLogLevel::INFO,
        message: "Home route".to_string(),
    }).unwrap();

    HttpServerHttpResponse {
        status_code: 200,
        headers: Some(vec![HttpServerKeyValuePair {
            key: "Content-Type".to_string(),
            value: "text/html".to_string(),
        }]),
        data: Some("Hello world!".as_bytes().to_vec()),
    }    
}
