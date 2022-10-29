pub mod wrap;
use polywrap_wasm_rs::JSON::json;
use serde::{Serialize, Deserialize};
use wrap::{*, imported::{ArgsLog, ArgsResolve, ArgsCreate}};

#[derive(Serialize, Deserialize)]
struct ResolveResponse {
    path: String
}

#[derive(Serialize, Deserialize)]
struct AddBody {
    files: Vec<RequestFile>
}

struct InMemoryFile {
    path: String,
    content: Option<Vec<u8>>
}

struct IpfsAddedFile {
    path: String,
    hash: String,
    size: u32
}

#[derive(Serialize, Deserialize)]
struct AddedFile {
    Name: String,
    Hash: String,
    Size: u32
}

pub fn main(args: ArgsMain) -> u8 {
    let port = if args.args.len() > 0 {
        args.args[0].parse::<u32>().unwrap()
    } else {
        8080
    };

    IpfsModule::create(&ArgsCreate {}).unwrap();

    HttpServerModule::start(&imported::http_server_module::ArgsStart {
        port,
        request_timeout: 10000, 
        routes: vec![
            HttpServerRoute {
                path: "/".to_string(),
                http_method: HttpServerHttpMethod::GET,
                handler: HttpServerWrapperCallback {
                    uri: "wrap://ens/ipfs-gateway.pwr-app.eth".to_string(),
                    method: "routeHome".to_string()
                }
            },
            HttpServerRoute {
                path: "/api/v0/resolve".to_string(),
                http_method: HttpServerHttpMethod::GET,
                handler: HttpServerWrapperCallback {
                    uri: "wrap://ens/ipfs-gateway.pwr-app.eth".to_string(),
                    method: "routeResolve".to_string()
                }
            }
        ], 
        on_start: Some(
            HttpServerWrapperCallback {
                uri: "wrap://ens/ipfs-gateway.pwr-app.eth".to_string(),
                method: "onStart".to_string()
            }
        ),
    }).unwrap();

    0
}

pub fn on_start(_: ArgsOnStart) -> bool {
    log("Server started".to_string());

    true
}

pub fn route_home(_: ArgsRouteHome) -> HttpServerResponse {
    log("Home route");

    HttpServerResponse {
        status_code: 200,
        headers: Some(vec![HttpServerKeyValuePair {
            key: "Content-Type".to_string(),
            value: "text/html".to_string(),
        }]),
        data: Some("Hello world!".as_bytes().to_vec()),
    }    
}

pub fn route_resolve(args: ArgsRouteResolve) -> HttpServerResponse {
    log("Resolve route");

    let name = args.request.query.iter().find(|kv| kv.key == "arg").unwrap().value.clone();

    log("/api/v0/resolve ".to_string() + &name);

    let result = IpfsModule::resolve(&ArgsResolve {
        name,
        options: Some(
            IpfsAbortOptions {
              timeout: Some(15000),
            }
        )
    });

    match result {
        Ok(result) => {
            log("/api/v0/resolve Ok ".to_string() + &result);
            to_json_response(ResolveResponse {
                path: result
            })
        }
        Err(err) => {
            log("/api/v0/mresolve Error".to_string());
            to_error_response(err)
        }
    }
}
fn prefix(words: Vec<String>) -> String {
    // check border cases size 1 array and empty first word)
    if words.len() <= 1 { return words.first() || ""; }
    let i = 0;
    // while all words have the same character at position i, increment i
    while(words[0][i] && words.every(|w| w[i] == words[0][i])) {
        i+=1;
    }
    // prefix is the substring from the beginning to the last successfully checked i
    return words[0].substr(0, i);
}

fn strip_base_path(files: Vec<InMemoryFile>) -> Vec<InMemoryFile> {
    let base_path = prefix(files.iter().map(|f| f.path).collect());
  
    return files.iter().map(|file| ({
      path: path.relative(basePath, file.path) ?? '.',
      content: file.content
    })).filter(|file| !!file.path)
    .collect();
  };
  
pub fn route_add(args: ArgsRouteAdd) -> HttpServerResponse {
  if args.request.files.is_empty() {
    return to_error_response("No files were uploaded".to_string());
  }

  let files: Vec<RequestFile> = args.request.files;

  let files_to_add = files.iter().map(|x| {
    let path_to_file = x.originalname;

    //If the file is a directory, we don't add the buffer, otherwise we get a different CID than expected
    if x.mimetype == "application/x-directory" {
      InMemoryFile {
        path: path_to_file,
        content: None
      }
    } else {
      InMemoryFile {
        path: path_to_file,
        content: Some(x.buffer)
      }
    }
  });

  let sanitizedFiles = stripBasePath(files_to_add);
  let result = this.deps.validationService.validateInMemoryWrapper(sanitizedFiles);
 
  if !result.valid {
    return to_error_response("Upload is not a valid wrapper. \nReason: ${result.failReason}");
  }

  let add_files_result = addFilesToIpfs(
    sanitizedFiles,
    { onlyHash: !!req.query["only-hash"] },
    ipfs
  );

  log("Gateway add: ".to_string() + &root_cid);

  if !add_files_result.root_cid.is_none() {
    return to_error_response("IPFS verification failed after upload. Upload is not a directory");
  }

  if (!ipfsResult.valid) {
    return to_error_response("IPFS verification failed after upload. Upload is not a valid wrapper. \nReason: ${ipfsResult.failReason}");
  }

  return to_json_response(
    added_files.map(|x| {
      AddedFile {
        path: x.path,
        hash: x.cid,
        size: x.size,
      };
    })
  );


  for (const file of addedFiles) {
    res.write(JSON.stringify({
      Name: file.path,
      Hash: file.cid.toString(),
      Size: file.size,
    }) + "\n");
  }
}

fn to_json_response<T: Serialize>(data: T) -> HttpServerResponse {
    HttpServerResponse {
        status_code: 200,
        headers: Some(vec![HttpServerKeyValuePair {
            key: "Content-Type".to_string(),
            value: "application/json".to_string(),
        }]),
        data: Some(
            json!(data)
                .to_string()
                .as_bytes()
                .to_vec()
        ),
    }    
}

fn to_error_response<S: Into<String>>(message: S) -> HttpServerResponse {
    HttpServerResponse {
        status_code: 500,
        headers: Some(vec![HttpServerKeyValuePair {
            key: "Content-Type".to_string(),
            value: "text/html".to_string(),
        }]),
        data: Some(message.as_bytes().to_vec()),
    }
}

fn log<S: Into<String>>(message: S) {
    LoggerModule::log(&ArgsLog {
        level: LoggerLogLevel::INFO,
        message: message.into(),
    }).unwrap();
}
