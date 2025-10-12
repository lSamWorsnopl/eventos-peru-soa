package pe.tucompu.eventos_api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class CryptoService {
    private final SecretKeySpec key;
    private final SecureRandom rnd = new SecureRandom();

    // APP_DATA_KEY debe ser 16 o 32 bytes en hex (p.ej. 32 hex => 16 bytes)
    public CryptoService(@Value("${APP_DATA_KEY}") String hexKey) {
        byte[] k = HexFormat.of().parseHex(hexKey);
        if (!(k.length == 16 || k.length == 32)) {
            throw new IllegalArgumentException("APP_DATA_KEY debe tener 16 o 32 bytes en hex");
        }
        this.key = new SecretKeySpec(k, "AES");
    }

    public String encrypt(String plain) {
        if (plain == null)
            return null;
        try {
            byte[] iv = new byte[12];
            rnd.nextBytes(iv);
            Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
            c.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(128, iv));
            byte[] ct = c.doFinal(plain.getBytes(StandardCharsets.UTF_8));
            byte[] packed = new byte[iv.length + ct.length];
            System.arraycopy(iv, 0, packed, 0, iv.length);
            System.arraycopy(ct, 0, packed, iv.length, ct.length);
            return Base64.getEncoder().encodeToString(packed);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public String decrypt(String enc) {
        if (enc == null)
            return null;
        try {
            byte[] packed = Base64.getDecoder().decode(enc);
            byte[] iv = java.util.Arrays.copyOfRange(packed, 0, 12);
            byte[] ct = java.util.Arrays.copyOfRange(packed, 12, packed.length);
            Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
            c.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(128, iv));
            byte[] out = c.doFinal(ct);
            return new String(out, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
