import express from "express";
import videoshow from "videoshow";
import fetch from "node-fetch";
import EventEmitter from "events";

import * as fs from "fs";
import * as path from "path";

const publicPath = path.join(__dirname, "public");

export default async function Route(req: express.Request, res: express.Response) {
    const id = req.params.id;

    try {
        const data = fs.readFileSync(path.join(publicPath, `${id}.mp4`));
        console.log(`Found Same Request: ${id}`);

        res.writeHead(200, { "Content-Type": "video/mp4" });
        res.end(data);

        return;
    }
    catch (e) { }

    try {
        const stream = await fetch(req.query.url as string);
        fs.writeFileSync(path.join(publicPath, `${id}.jpg`), new Uint8Array(await stream.arrayBuffer()));

        console.log(`Image Saved: ${id}`);

        const vs: EventEmitter = videoshow([path.join(publicPath, `${id}.jpg`)], {
            fps: 5,
            loop: 5, // in seconds
            transition: false,
            videoBitrate: 1024,
            videoCodec: 'libx264',
            format: 'mp4',
            pixelFormat: 'yuv420p'
        }).save(path.join(publicPath, `${id}.mp4`));

        vs.on('end', function () {
            console.log(`Video Saved: ${id}`);
            res.writeHead(200, { "Content-Type": "video/mp4" });
            res.end(fs.readFileSync(path.join(publicPath, `${id}.mp4`)));
        });

        fs.unlinkSync(path.join(publicPath, `${id}.jpg`));
        setTimeout(() => {
            fs.unlinkSync(path.join(publicPath, `${id}.mp4`));
        }, 60000);
    }
    catch (e) { 
        console.log(e);
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
    }
}