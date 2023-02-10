package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"net"
	"net/http"
	"os"

	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"github.com/sirupsen/logrus"
)

var logger = logrus.New()

func main() {
	var socketPath string
	flag.StringVar(&socketPath, "socket", "/run/guest-services/backend.sock", "Unix domain socket to listen on")
	flag.Parse()

	_ = os.RemoveAll(socketPath)

	logger.SetOutput(os.Stdout)

	logMiddleware := middleware.LoggerWithConfig(middleware.LoggerConfig{
		Skipper: middleware.DefaultSkipper,
		Format: `{"time":"${time_rfc3339_nano}","id":"${id}",` +
			`"method":"${method}","uri":"${uri}",` +
			`"status":${status},"error":"${error}"` +
			`}` + "\n",
		CustomTimeFormat: "2006-01-02 15:04:05.00000",
		Output:           logger.Writer(),
	})

	logger.Infof("Starting listening on %s\n", socketPath)
	router := echo.New()
	router.HideBanner = true
	router.Use(logMiddleware)
	startURL := ""

	ln, err := listen(socketPath)
	if err != nil {
		logger.Fatal(err)
	}
	router.Listener = ln

	router.GET("/token/:namespace/:name", getToken)

	logger.Fatal(router.Start(startURL))
}

func listen(path string) (net.Listener, error) {
	return net.Listen("unix", path)
}

func getJson(res *http.Response, target interface{}) error {
	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return err
	}
	return json.Unmarshal(body, target)
}

type TokenResponse struct {
	Token        string
	Access_token string
	Expires_in   int
	Issued_at    string
}

func getToken(ctx echo.Context) error {
	namespace := ctx.Param("namespace")
	name := ctx.Param("name")
	resp, err := http.Get(fmt.Sprintf("https://auth.docker.io/token?service=registry.docker.io&scope=repository:%s/%s:pull", namespace, name))
	if err != nil {
		logger.Errorf("Error getting token: %s", err)
		return ctx.JSON(http.StatusInternalServerError, HTTPMessageBody{
			Message: err.Error(),
		})
	} else {
		if err != nil {
			logger.Errorf("Error reading token response: %s", err)
			return ctx.JSON(http.StatusInternalServerError, HTTPMessageBody{})
		}
		token := new(TokenResponse)
		err = getJson(resp, &token)
		if err != nil {
			logger.Errorf("Error parsing token response: %s", err)
			return ctx.JSON(http.StatusInternalServerError, HTTPMessageBody{})
		}

		return ctx.JSON(resp.StatusCode, token)
	}
}

type HTTPMessageBody struct {
	Message string
}
