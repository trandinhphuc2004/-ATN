package com.chemlab.config;

import io.netty.resolver.DefaultAddressResolverGroup;
import reactor.netty.http.client.HttpClient;

/**
 * Tao HttpClient (Reactor Netty) dung chung cho WebClient.
 *
 * Mac dinh Netty dung DNS resolver rieng, tu doc danh sach DNS server -> tren may co
 * VPN/Cloudflare WARP no lay phai 127.0.2.3 va bi timeout ("Failed to resolve 'openrouter.ai'").
 * DefaultAddressResolverGroup dung resolver cua JDK (= DNS cua he dieu hanh) nen on dinh hon.
 */
public final class HttpClients {

    private HttpClients() {
    }

    public static HttpClient create() {
        return HttpClient.create().resolver(DefaultAddressResolverGroup.INSTANCE);
    }
}
