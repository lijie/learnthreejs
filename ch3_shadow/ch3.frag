#define SHADOWMAP_TYPE_PCF

#if NUM_DIR_LIGHTS > 0
struct DirectionalLight {
    vec3 direction;
    vec3 color;
};
uniform DirectionalLight directionalLights[NUM_DIR_LIGHTS];
uniform sampler2D directionalShadowMap[NUM_DIR_LIGHTS];
varying vec4 v_positionInShadowSpaces[NUM_DIR_LIGHTS];

struct DirectionalLightShadow {
    float shadowBias;
    float shadowNormalBias;
    float shadowRadius;
    vec2 shadowMapSize;
};
DirectionalLightShadow directionalLightShadows[NUM_DIR_LIGHTS];
#endif

uniform sampler2D map;
uniform vec3 ambientLightColor;
varying vec2 v_uv;
varying vec3 v_normal;
varying vec4 v_position;

const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );

float unpackRGBAToDepth( const in vec4 v ) {
    return dot( v, UnpackFactors );
}

 float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
        return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
}

float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
        float shadow = 1.0;
        shadowCoord.xyz /= shadowCoord.w;
        shadowCoord.z += shadowBias;
        bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );
        bool inFrustum = all( inFrustumVec );
        bvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );
        bool frustumTest = all( frustumTestVec );
        if ( frustumTest ) {
            #if defined( SHADOWMAP_TYPE_PCF )
                vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
                float dx0 = - texelSize.x * shadowRadius;
                float dy0 = - texelSize.y * shadowRadius;
                float dx1 = + texelSize.x * shadowRadius;
                float dy1 = + texelSize.y * shadowRadius;
                float dx2 = dx0 / 2.0;
                float dy2 = dy0 / 2.0;
                float dx3 = dx1 / 2.0;
                float dy3 = dy1 / 2.0;
                shadow = (
                texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
                texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
                texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
                texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
                texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
                texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
                texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
                texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
                texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
                texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
                texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
                texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
                texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
                texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
                texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
                texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
                texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
                ) * ( 1.0 / 17.0 );
                #elif defined( SHADOWMAP_TYPE_PCF_SOFT )
                vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
                float dx = texelSize.x;
                float dy = texelSize.y;
                vec2 uv = shadowCoord.xy;
                vec2 f = fract( uv * shadowMapSize + 0.5 );
                uv -= f * texelSize;
                shadow = (
                texture2DCompare( shadowMap, uv, shadowCoord.z ) +
                texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
                texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
                texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
                mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ), texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ), f.x ) +
                mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ), texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ), f.x ) +
                mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ), texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ), f.y ) +
                mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ), texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ), f.y ) +
                mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ), texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ), f.x ), mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ), texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ), f.x ), f.y )
                ) * ( 1.0 / 9.0 );
                #elif defined( SHADOWMAP_TYPE_VSM )
                shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
            #else
                shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
            #endif
        }
        return shadow;
}

void main() {
    // 平行光的方向和颜色
    vec3 unitDirectionLight = normalize(directionalLights[0].direction);
    vec3 lightColor = directionalLights[0].color;

    // 漫反射强度和颜色
    float diffuseIntensity = dot(v_normal, unitDirectionLight);
    vec4 diffuse = texture(map, v_uv);

    vec3 eyeDirection = -(v_position.xyz);
    vec3 halfwayDirection   = normalize(unitDirectionLight + eyeDirection);
    float specularIntensity = clamp(dot(v_normal, halfwayDirection), 0.0, 1.0);

    // 环境光
    vec3 ambient = ambientLightColor * diffuse.rgb * 1.0;

    // shadow
    float shadowMask = getShadow(directionalShadowMap[0],
                                 directionalLightShadows[0].shadowMapSize,
                                 directionalLightShadows[0].shadowBias,
                                 directionalLightShadows[0].shadowRadius, v_positionInShadowSpaces[0]);
    diffuse.rgb = diffuse.rgb * shadowMask;

    // 计算最终输出
    vec3 diffuseColor = diffuse.rgb * lightColor * diffuseIntensity;
    vec3 ambientColor = ambient.rgb;
    // vec3 specularColor = lightColor * pow(specularIntensity, 128.0);
    vec3 specularColor = vec3(0, 0, 0);

    gl_FragColor = vec4(ambientColor + diffuseColor + specularColor, 1.0);
}
